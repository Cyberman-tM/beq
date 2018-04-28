/*
   Copied from https://github.com/devsnek/googlebot/tree/master
   (Lobotomized for simpler result)
*/
module.exports = (title, description = title, color) => {
  return {
     color: color,
     title,
    description: `${description}`,
    footer: { }
  }
}
