// Personalize the entire greeting here. Assets are discovered at build time.
export const greeting = {
  name: 'Uncle Rohana',
  vehicle: '2026 Honda Vezel',
  subtitle: "Here's to your new ride and the exciting journeys ahead.",
  paragraphs: [
    'Congratulations on your beautiful new Vezel! Wishing you countless happy miles, safe journeys, wonderful adventures, and unforgettable memories in your new ride.',
    'May this new chapter bring you happiness, success, and many exciting destinations.',
    'Enjoy every moment behind the wheel!',
  ],
  signature: 'With love and best wishes',
  // Change this if the front of your GLB faces another direction (radians).
  modelRotation: 0,
};
const photos = import.meta.glob('/public/images/uncle-rohana.jpg', { eager: true, query: '?url', import: 'default' });
const models = import.meta.glob('/public/models/vezel.glb', { eager: true, query: '?url', import: 'default' });
export const photoUrl = Object.keys(photos).length ? '/images/uncle-rohana.jpg' : null;
export const modelUrl = Object.keys(models).length ? '/models/vezel.glb' : null;
