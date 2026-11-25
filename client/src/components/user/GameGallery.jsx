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
      <div style={{ position: 'relative' }}>
        <Image.PreviewGroup items={mediaList}>
          <div
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              background: '#F1F5F9',
              marginBottom: 10,
            }}
          >
            <Image
              src={selectedImage}
              alt={title}
              width="100%"
              height={310}
              style={{ objectFit: 'cover', display: 'block', cursor: 'pointer' }}
            />
          </div>
        </Image.PreviewGroup>

        {mediaList.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              className="pv-gallery-arrow"
              style={{ left: 10 }}
              onClick={handlePrev}
            >
              <LeftOutlined style={{ fontSize: 13 }} />
            </button>
            <button
              type="button"
              aria-label="Ảnh tiếp theo"
              className="pv-gallery-arrow"
              style={{ right: 10 }}
              onClick={handleNext}
            >
              <RightOutlined style={{ fontSize: 13 }} />
            </button>
            <div
              className="font-mono-num"
              style={{
                position: 'absolute',
                bottom: 20,
                right: 12,
                zIndex: 10,
                background: 'rgba(15, 23, 42, 0.72)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 9px',
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
                  height: 52,
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isActive ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                  opacity: isActive ? 1 : 0.7,
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
