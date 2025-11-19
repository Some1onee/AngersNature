import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/button";

interface ImageGalleryProps {
  images: string[];
  alts?: string[];
}

const ImageGallery = ({ images, alts = [] }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openImage = (index: number) => {
    setSelectedIndex(index);
  };

  const closeImage = () => {
    setSelectedIndex(null);
  };

  const nextImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => openImage(index)}
          >
            <img
              src={image}
              alt={alts[index] || `Image ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={closeImage}>
        <DialogContent className="max-w-7xl p-0 bg-black/95">
          {selectedIndex !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
                onClick={closeImage}
              >
                <X className="h-6 w-6" />
              </Button>

              <img
                src={images[selectedIndex]}
                alt={alts[selectedIndex] || `Image ${selectedIndex + 1}`}
                className="w-full h-[80vh] object-contain"
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
