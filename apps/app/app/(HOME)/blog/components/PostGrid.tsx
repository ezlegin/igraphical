import { Image, Post, PostCategory } from "@igraph/database";
import PostCard from "./PostCard";

export interface PostType extends Post {
  image: Image | null;
  categories: PostCategory[];
}

export interface CategoriesType {
  category: PostCategory;
  postId: number;
  categoryId: number;
}

interface Props {
  posts: PostType[];
}

const PostGrid = ({ posts }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
};

export default PostGrid;
