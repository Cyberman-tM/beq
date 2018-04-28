/*
   Copied from https://github.com/devsnek/googlebot/tree/master
   (Some values changed)

*/
module.exports = (url, title = url, description = 'ᅠ') => {
  if (description !== 'ᅠ') description += '\n';
  return {
    title,
    description: `${description}`,
    url,
    timestamp: new Date(),
    video: { url },
    image: { url },
    footer: {
      text: 'test',
      icon_url: 'https://google.com/favicon.ico'
    }
  }
}