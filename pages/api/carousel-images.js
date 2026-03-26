import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const dirRelativeToPublicFolder = 'carousel';
  const dir = path.resolve('./public', dirRelativeToPublicFolder);
  
  try {
    // If the directory doesn't exist, create it (optional but helpful)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filenames = fs.readdirSync(dir);
    
    // Filter out only images (jpg, jpeg, png, gif, webp, svg)
    const images = filenames
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
      })
      .map((name, index) => ({
        id: index + 1,
        image: `/${dirRelativeToPublicFolder}/${name}`,
        title: name, // Default title to filename
      }));

    res.status(200).json(images);
  } catch (error) {
    console.error('Error reading carousel directory', error);
    res.status(500).json({ error: 'Failed to read directory' });
  }
}
