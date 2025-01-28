import { getDb } from '../migrations-utils/db';

const categories = [
  { name: 'Technology', description: 'All things tech-related' },
  { name: 'Health', description: 'Health and wellness tips' },
  { name: 'Education', description: 'Educational resources and articles' },
  { name: 'Lifestyle', description: 'Lifestyle, hobbies, and more' },
  { name: 'Science', description: 'Science article, technology' },
];

export const up = async () => {
  const db = await getDb();
  try {
    await db.collection('categories').insertMany(categories);
    console.log('Categories populated successfully.');
  } catch (error) {
    console.error('Error populating categories:', error);
  }
};

export const down = async () => {
  const db = await getDb();
  try {
    await db.collection('categories').deleteMany({
      name: { $in: categories.map((category) => category.name) },
    });
    console.log('Categories removed successfully.');
  } catch (error) {
    console.error('Error removing categories:', error);
  }
};
