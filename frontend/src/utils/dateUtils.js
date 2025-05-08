export const formatPostDateTime = (post) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const date = new Date(post.publishedAt || post.createdAt);
    const dateString = date.toLocaleString('en-US', options);
    
    return post.status === 'draft'
      ? `Drafted ${dateString}`
      : `Published ${dateString}`;
  };

  export const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
   
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
