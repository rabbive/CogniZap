import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { UploadResponse } from '$lib/types';
import type * as yauzl from 'yauzl';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return json({
        success: false,
        error: 'No file uploaded'
      } as UploadResponse, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint'
    ];

    if (!allowedTypes.includes(file.type)) {
      return json({
        success: false,
        error: 'File type not supported. Please upload PDF or PowerPoint files.'
      } as UploadResponse, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.'
      } as UploadResponse, { status: 400 });
    }

    let extractedText = '';

    try {
      console.log(`📄 Processing ${file.type} file: ${file.name}`);
      
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (file.type.includes('presentation') || file.type.includes('powerpoint')) {
        extractedText = await extractTextFromPPT(file);
      }

      if (!extractedText.trim()) {
        return json({
          success: false,
          error: 'No text content found in the file. Please ensure the file contains readable text.'
        } as UploadResponse, { status: 400 });
      }

      // Limit text length for processing
      const maxTextLength = 10000; // 10k characters
      if (extractedText.length > maxTextLength) {
        extractedText = extractedText.substring(0, maxTextLength) + '\n\n[Content truncated for processing...]';
      }

      console.log(`✅ Extracted ${extractedText.length} characters from ${file.name}`);

      return json({
        success: true,
        text: extractedText,
        filename: file.name,
        fileSize: file.size
      } as UploadResponse);

    } catch (error) {
      console.error('File processing error:', error);
      return json({
        success: false,
        error: `Failed to process ${file.name}. Please ensure the file is not corrupted or password-protected.`
      } as UploadResponse, { status: 500 });
    }

  } catch (error) {
    console.error('Upload API error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process upload'
    } as UploadResponse, { status: 500 });
  }
};

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker path for PDF.js
    if (typeof window === 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${process.cwd()}/static/pdf.worker.min.js`;
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log(`📄 Starting PDF processing for ${file.name} (${uint8Array.length} bytes)`);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      isEvalSupported: true,
      useWorkerFetch: true,
      standardFontDataUrl: '/standard_fonts/',
      cMapUrl: '/cmaps-minimal/',
      cMapPacked: true,
      disableFontFace: true,
      verbosity: 1
    });

    // Add error handler for the loading task
    loadingTask.onPassword = (updatePassword: (password: string) => void, reason: number) => {
      console.warn('PDF is password protected:', reason);
      throw new Error('PDF is password protected');
    };

    const pdf = await loadingTask.promise;
    let fullText = '';
    
    console.log(`📖 Processing PDF with ${pdf.numPages} pages`);
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        
        // Get text content
        const textContent = await page.getTextContent();
        
        // Process text content with better formatting
        const pageText = textContent.items
          .map((item: any) => {
            if (typeof item.str === 'string' && item.str.trim()) {
              // Handle different text item types and preserve formatting
              const text = item.str.trim();
              // Add newline for items that appear to be headers or separate paragraphs
              const fontSize = item.transform ? Math.sqrt(item.transform[0] * item.transform[0] + item.transform[1] * item.transform[1]) : 0;
              return fontSize >= 12 ? `\n${text}\n` : `${text} `;
            }
            return '';
          })
          .join('')
          .replace(/\s+/g, ' ')  // Normalize whitespace
          .trim();
        
        if (pageText) {
          fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
        }
        
        // Clean up page resources
        await page.cleanup();
      } catch (pageError) {
        console.warn(`Warning: Could not process page ${pageNum}:`, pageError);
        fullText += `\n--- Page ${pageNum} (processing error) ---\n`;
      }
    }
    
    // Clean up PDF resources
    await pdf.destroy();
    
    // Verify extracted content
    if (!fullText.trim()) {
      console.error('No text content extracted from PDF');
      throw new Error('No readable text content found in the PDF file');
    }
    
    // Clean up the extracted text
    fullText = fullText
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
      .replace(/[^\S\n]+/g, ' ')    // Normalize spaces but keep newlines
      .trim();
    
    console.log(`✅ Successfully extracted ${fullText.length} characters from PDF`);
    return fullText;
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('password')) {
        throw new Error('The PDF file is password protected. Please provide an unprotected file.');
      } else if (error.message.includes('corrupted') || error.message.includes('invalid')) {
        throw new Error('The PDF file appears to be corrupted. Please try a different file.');
      } else if (error.message.includes('text content')) {
        throw new Error('No readable text found in the PDF. The file might be scanned or contain only images.');
      }
    }
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractTextFromPPT(file: File): Promise<string> {
  try {
    console.log(`📊 Processing PowerPoint file: ${file.name}`);
    
    // PowerPoint files are ZIP archives, we'll extract text from XML files
    const yauzlModule = await import('yauzl');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return new Promise((resolve, reject) => {
      yauzlModule.fromBuffer(buffer, { lazyEntries: true }, (err: Error | null, zipfile?: yauzl.ZipFile) => {
        if (err) {
          reject(new Error(`Failed to read PowerPoint file: ${err.message}`));
          return;
        }
        
        if (!zipfile) {
          reject(new Error('Invalid PowerPoint file format'));
          return;
        }
        
        let extractedText = '';
        let processedSlides = 0;
        
        zipfile.readEntry();
        
        zipfile.on('entry', (entry: yauzl.Entry) => {
          // Look for slide content files
          if (entry.fileName.startsWith('ppt/slides/slide') && entry.fileName.endsWith('.xml')) {
            zipfile.openReadStream(entry, (err: Error | null, readStream?: NodeJS.ReadableStream) => {
              if (err) {
                console.warn(`Could not read ${entry.fileName}:`, err);
                zipfile.readEntry();
                return;
              }
              
              let xmlContent = '';
              readStream!.on('data', (chunk: Buffer) => {
                xmlContent += chunk.toString();
              });
              
              readStream!.on('end', () => {
                try {
                  // Extract text from PowerPoint XML
                  const slideText = extractTextFromPowerPointXML(xmlContent);
                  if (slideText.trim()) {
                    processedSlides++;
                    extractedText += `\n--- Slide ${processedSlides} ---\n${slideText}\n`;
                  }
                } catch (xmlError) {
                  console.warn(`Error processing slide XML:`, xmlError);
                }
                zipfile.readEntry();
              });
              
              readStream!.on('error', (streamError: Error) => {
                console.warn(`Stream error for ${entry.fileName}:`, streamError);
                zipfile.readEntry();
              });
            });
          } else {
            zipfile.readEntry();
          }
        });
        
        zipfile.on('end', () => {
          if (extractedText.trim()) {
            console.log(`✅ Extracted text from ${processedSlides} slides`);
            resolve(extractedText.trim());
          } else {
            reject(new Error('No readable text content found in PowerPoint file'));
          }
        });
        
        zipfile.on('error', (zipError: Error) => {
          reject(new Error(`PowerPoint processing error: ${zipError.message}`));
        });
      });
    });
    
  } catch (error) {
    console.error('PowerPoint extraction error:', error);
    throw new Error(`PowerPoint processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractTextFromPowerPointXML(xmlContent: string): string {
  try {
    // Extract text from PowerPoint XML using regex patterns
    // This handles the most common text elements in PowerPoint slides
    const textPatterns = [
      /<a:t[^>]*>(.*?)<\/a:t>/g,  // Text runs
      /<a:fld[^>]*>(.*?)<\/a:fld>/g,  // Fields
    ];
    
    let extractedText = '';
    
    for (const pattern of textPatterns) {
      let match;
      while ((match = pattern.exec(xmlContent)) !== null) {
        const text = match[1]
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .trim();
        
        if (text && text.length > 0) {
          extractedText += text + ' ';
        }
      }
    }
    
    // Clean up and format the text
    return extractedText
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n\s*\n/g, '\n')  // Remove empty lines
      .trim();
      
  } catch (error) {
    console.warn('XML parsing error:', error);
    return '';
  }
} 