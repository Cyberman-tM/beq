/*
   Copied from https://github.com/devsnek/googlebot/tree/master
   (and adapted for my uses)
*/
module.exports = (title, description = title, color, footer, foot_col, link, video, image) => {
  return {
    color: color,
    title,
    description: `${description}`,
    link,
    video: { video },
    image: { image },
    fields:[{ name: 'tlhingan', value: 'klingon'}, {name:'english', value:'english'}],     
    footer: {
      color: foot_col,
      text: footer,
    }
  }
}
