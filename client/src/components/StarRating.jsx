import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, size = 'text-lg', editable = false, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (editable && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (editable) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (editable) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        let Icon = FaRegStar;
        let color = 'text-gray-300';
        
        if (displayRating >= star) {
          Icon = FaStar;
          color = 'text-yellow-500';
        } else if (displayRating >= star - 0.5) {
          Icon = FaStarHalfAlt;
          color = 'text-yellow-500';
        }

        return (
          <button
            key={star}
            type="button"
            className={`${color} ${size} transition-transform duration-200 ${
              editable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={!editable}
          >
            <Icon />
          </button>
        );
      })}
      {!editable && rating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;