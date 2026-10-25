declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
  }
  function pdf(dataBuffer: Buffer, options?: Record<string, unknown>): Promise<PDFData>;
  export = pdf;
}
