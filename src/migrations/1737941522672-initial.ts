import { getDb } from '../migrations-utils/db';

export const up = async () => {
  const db = await getDb();
  const categories = [
    { name: 'Technology', description: 'All things tech-related' },
    { name: 'Health', description: 'Health and wellness tips' },
    { name: 'Education', description: 'Educational resources and articles' },
    { name: 'Lifestyle', description: 'Lifestyle, hobbies, and more' },
  ];

  // Insert predefined categories into the "categories" collection
  try {
    await db.collection('categories').insertMany(categories);
    console.log('Categories populated successfully.');
  } catch (error) {
    console.error('Error populating categories:', error);
  }
};

export const down = async () => {
  const db = await getDb();
  /*
      Code you downgrade script here!
   */
};
