import React, { useState } from 'react';
import { Button } from '../ui/button';
import { MdFavorite, MdShoppingCart, MdDownload, MdShare } from 'react-icons/md';

const ButtonShowcase = () => {
  const [liked, setLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDownloading(false);
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAddingToCart(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Advanced Button Patterns</h2>
      
      <div className="space-y-6">
        {/* Action Buttons */}
        <div>
          <h3 className="text-lg font-medium mb-3">Interactive Action Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={liked ? "destructive" : "outline"}
              onClick={() => setLiked(!liked)}
              className="transition-all duration-300"
            >
              <MdFavorite className={`h-4 w-4 ${liked ? 'text-white' : 'text-red-500'}`} />
              {liked ? 'Liked!' : 'Like'}
            </Button>

            <Button
              variant="primary"
              loading={addingToCart}
              onClick={handleAddToCart}
            >
              <MdShoppingCart className="h-4 w-4" />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>

            <Button
              variant="success"
              loading={downloading}
              onClick={handleDownload}
            >
              <MdDownload className="h-4 w-4" />
              {downloading ? 'Downloading...' : 'Download'}
            </Button>

            <Button variant="ghost">
              <MdShare className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Button Groups */}
        <div>
          <h3 className="text-lg font-medium mb-3">Button Groups</h3>
          <div className="flex rounded-md shadow-sm" role="group">
            <Button
              variant="outline"
              className="rounded-r-none border-r-0 focus:z-10"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="rounded-none border-r-0 focus:z-10"
            >
              Current
            </Button>
            <Button
              variant="outline"
              className="rounded-l-none focus:z-10"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Size Variations with Icons */}
        <div>
          <h3 className="text-lg font-medium mb-3">Sizes with Icons</h3>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="primary">
              <MdShoppingCart className="h-3 w-3" />
              Small
            </Button>
            <Button size="default" variant="primary">
              <MdShoppingCart className="h-4 w-4" />
              Default
            </Button>
            <Button size="lg" variant="primary">
              <MdShoppingCart className="h-5 w-5" />
              Large
            </Button>
            <Button size="xl" variant="primary">
              <MdShoppingCart className="h-6 w-6" />
              Extra Large
            </Button>
          </div>
        </div>

        {/* Medical Themed Buttons */}
        <div>
          <h3 className="text-lg font-medium mb-3">Medical Marketplace Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="primary" className="w-full">
              Order Now
            </Button>
            <Button variant="success" className="w-full">
              In Stock
            </Button>
            <Button variant="warning" className="w-full">
              Low Stock
            </Button>
            <Button variant="destructive" className="w-full">
              Out of Stock
            </Button>
          </div>
        </div>

        {/* Disabled States */}
        <div>
          <h3 className="text-lg font-medium mb-3">Disabled States</h3>
          <div className="flex flex-wrap gap-3">
            <Button disabled>Disabled Default</Button>
            <Button variant="primary" disabled>Disabled Primary</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
            <Button variant="ghost" disabled>Disabled Ghost</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonShowcase;
