/**
 * Real Human Placeholder Photos for Photobooth Preview
 * Menggunakan foto placeholder manusia asli beresolusi optimal
 * untuk pratinjau template di layar setup dan admin.
 */

export const REAL_HUMAN_PHOTOS: Record<number, string> = {
  0: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces,top&w=500&h=600&q=85',
  1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces,top&w=500&h=600&q=85',
  2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&crop=faces,top&w=500&h=600&q=85',
  3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=faces,top&w=500&h=600&q=85',
  4: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&crop=faces,top&w=500&h=600&q=85',
  5: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&crop=faces,top&w=500&h=600&q=85',
}

export function getDummyPhotos(): Record<number, string> {
  return REAL_HUMAN_PHOTOS
}
