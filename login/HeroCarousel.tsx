'use client';

interface HeroItem {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
}

interface HeroCarouselProps {
  items: HeroItem[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

export function HeroCarousel({
  items,
  currentSlide,
  onSlideChange,
}: HeroCarouselProps) {
  if (items.length === 0) return null;

  const current = items[currentSlide];
  const handlePrev = () =>
    onSlideChange((currentSlide - 1 + items.length) % items.length);
  const handleNext = () => onSlideChange((currentSlide + 1) % items.length);

  return (
    <div className="carousel-slide-container">s
      <div className="carousel-slide">
        <img
          src={current.image}
          alt={current.title}
          className="carousel-image"
        />
        <div className="carousel-content">
          <span className="carousel-badge">{current.category}</span>
          <h2>{current.title}</h2>
          <p>{current.subtitle}</p>
        </div>
      </div>

      <div className="carousel-controls">
        <button
          className="carousel-btn carousel-btn-prev"
          onClick={handlePrev}
          aria-label="Previous slide"
          type="button"
        >
          ‹
        </button>
        <button
          className="carousel-btn carousel-btn-next"
          onClick={handleNext}
          aria-label="Next slide"
          type="button"
        >
          ›
        </button>
      </div>

      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => onSlideChange(index)}
            aria-label={`Go to slide ${index + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}