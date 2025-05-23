import type React from "react";
import type { Category } from "../../types";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/category/${category.id}`}
      className="card p-4 transition duration-300 overflow-hidden relative"
    >
      <div className="relative mb-4">
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-full aspect-square object-cover rounded-md shadow-md"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-md" />
      </div>
      <h3 className="text-spotify-text-primary font-bold text-xl truncate">
        {category.name}
      </h3>
    </Link>
  );
};

export default CategoryCard;
