const sharp = require('sharp');
sharp('public/images/ambiente.jpg')
  .webp({ quality: 80 })
  .toFile('public/images/ambiente.webp')
  .then(info => {
    console.log('Success:', info);
  })
  .catch(err => {
    console.error('Error:', err);
  });
