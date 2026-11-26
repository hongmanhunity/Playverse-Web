import { useState } from 'react';
import { Image } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const GameGallery = ({ title, mediaList = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = activeIndex < mediaList.length ? activeIndex : 0;
  const selectedImage = mediaList[safeIndex] || '';

  const handlePrev = (e) => {
    e.stopPropagation();
    if (mediaList.length <= 1) return;
    setActiveIndex((safeIndex - 1 + mediaList.length) % mediaList.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (mediaList.length <= 1) return;
    setActiveIndex((safeIndex + 1) % mediaList.length);
  };

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: mediaList.length > 1 ? 10 : 0 }}>
        <Image.PreviewGroup items={mediaList}>
          <div className="pv-detail-media">
            <Image
              src={selectedImage}
              alt={title}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </Image.PreviewGroup>

        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              className="pv-gallery-arrow"
              style={{ left: 14 }}
              onClick={handlePrev}
            >
              <LeftOutlined style={{ fontSize: 13 }} />
            </button>
            <button
              type="button"
              aria-label="Ảnh tiếp theo"
              className="pv-gallery-arrow"
              style={{ right: 14 }}
              onClick={handleNext}
            >
              <RightOutlined style={{ fontSize: 13 }} />
            </button>
            <div
              className="font-mono-num"
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                zIndex: 10,
                background: 'rgba(15, 23, 42, 0.72)',
                backdropFilter: 'blur(6px)',
                color: '#fff',
                fontSize: 11.5,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
                pointerEvents: 'none',
              }}
            >
              {safeIndex + 1} / {mediaList.length}
            </div>
          </>
        )}
      </div>

      {mediaList.length > 1 && (
        <div className="pv-thumb-strip">
          {mediaList.map((imgUrl, idx) => {
            const isActive = idx === safeIndex;
            return (
              <div
                key={imgUrl + idx}
                onClick={() => setActiveIndex(idx)}
                style={{
                  height: 58,
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isActive ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                  opacity: isActive ? 1 : 0.68,
                  boxShadow: isActive ? '0 3px 10px rgba(79, 70, 229, 0.2)' : 'none',
                  transition: 'all 180ms ease',
                }}
              >
                <img
                  src={imgUrl}
                  alt={`${title} preview ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameGallery;
