// Personalize the entire greeting here. Assets are discovered at build time.
export const greeting = {
  name: 'Uncle Rohana',
  vehicle: 'Honda Vezel',
  subtitle: "Here's to your new ride and the exciting journeys ahead.",
  paragraphs: [
    'Congratulations on your beautiful new Vezel! Wishing you countless happy miles, safe journeys, wonderful adventures, and unforgettable memories in your new ride.',
    'May this new chapter bring you happiness, success, and many exciting destinations.',
    'Enjoy every moment behind the wheel!',
  ],
  sender: 'Kaviya',
  signature: 'With love, Kaviya',
  // Change this if the front of your GLB faces another direction (radians).
  modelRotation: 0,
};
export const photoUrl = __PHOTO_URL__ ? import.meta.env.BASE_URL + __PHOTO_URL__.slice(1) : null;
export const modelUrl = __MODEL_URL__ ? import.meta.env.BASE_URL + __MODEL_URL__.slice(1) : null;
