var _ = require('lodash');

const dummy = (blogs) => {
    return 1;
  }

const totalLikes = (blogs) => {

    const likes = (sum, item) => {
        return sum+item
    }
    return blogs.reduce(likes, 0)
}

const favoriteBlog = (blogs) => {
  let tykkaukset= 0;
  const likes = (biggest, blog) => {
     
    if(blog.likes>tykkaukset) {
      biggest=blog
      tykkaukset=blog.likes
      
    }
    return biggest
  //return blogs.filter(blog => blog.likes === biggest);   
  }
return blogs.reduce(likes, 0)   
}

// Lodash- library is used in mostBlogs and mostLikes functions 
const mostBlogs = (blogs) => {

  const countByAuthor = _.countBy(blogs, 'author' )
  console.log(countByAuthor);
  const most = _.max(_.values(countByAuthor))
  const author = _.findKey(countByAuthor, (o) => {
    return o=== most
  })
  return { author: author, blogs: most }
}

const mostLikes = (blogs) => {

  const groupByAuthor = _.groupBy(blogs, 'author' )
  //console.log(groupByAuthor)
  const mapByAuthorAndLikes = _.map(groupByAuthor, (group, author) => ({
    author,
    likes: _.sumBy(group, 'likes'),
  }));
  //console.log(mapByAuthorAndLikes)
  const most = _.maxBy(mapByAuthorAndLikes, 'likes')
  //console.log(most.likes)
 
  return most.likes;
}


  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }
