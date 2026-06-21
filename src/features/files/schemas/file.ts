import { z } from 'zod';

export const fileMetadataSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255),
  fileType: z.string().min(1, 'File type is required').max(50),
  fileSize: z.coerce.number().min(1, 'File size must be greater than 0'),
  projectId: z.string().uuid().optional().nullable(),
});

export type FileMetadataInput = z.infer<typeof fileMetadataSchema>;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'text/csv',
  'text/plain',
  'text/markdown',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
];

export function validateFile(fileName: string, fileSize: number, fileType: string) {
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 10MB limit.');
  }

  // Fallback check: check extension if mime-type is blank or generic
  const isTypeAllowed = ALLOWED_FILE_TYPES.includes(fileType) || 
    /\.(jpe?g|png|gif|webp|svg|pdf|docx?|xlsx?|csv|txt|md|zip|rar)$/i.test(fileName);

  if (!isTypeAllowed) {
    throw new Error('Unsupported file type. Allowed: Images, PDF, Word, Excel, TXT, CSV, ZIP, RAR.');
  }
}
