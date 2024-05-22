import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import '../css/LandingPage.css'; // Import the CSS file

function LandingPage() {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    // Fetch initial posts
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    // Mock API call to fetch posts
    // You can replace this with your actual API call
    const newPosts = [
      // Mock data for demonstration
      { id: 1, imageUrl: 'image1.jpg', description: 'Description 1', link: 'https://example.com', likes: 10 },
      { id: 2, imageUrl: 'image2.jpg', description: 'Description 2', link: 'https://example.com', likes: 20 },
      // Add more posts here as needed
    ];

    // Simulate loading delay
    setTimeout(() => {
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setHasMore(false); // Set to false to stop infinite loading in this example
    }, 1000);
  };

  return (
    <div>
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchPosts}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more posts</p>}
      >
        {posts.map(post => (
          <div key={post.id} className="post">
            <img src={post.imageUrl} alt="Post" />
            <div className="post-content">
              <p>{post.description}</p>
              <a href={post.link} target="_blank" rel="noopener noreferrer">Link</a>
              <p>Likes: {post.likes}</p>
              <button>Chat</button>
            </div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}

export default LandingPage;
