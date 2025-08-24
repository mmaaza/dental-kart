import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import ButtonShowcase from "../components/examples/ButtonShowcase";
import * as Toast from "@radix-ui/react-toast";
import * as Switch from "@radix-ui/react-switch";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Tabs from "@radix-ui/react-tabs";
import * as Accordion from "@radix-ui/react-accordion";
import * as Progress from "@radix-ui/react-progress";
import * as Slider from "@radix-ui/react-slider";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Avatar from "@radix-ui/react-avatar";
import * as Separator from "@radix-ui/react-separator";
import { 
  MdCheck, 
  MdKeyboardArrowDown, 
  MdPerson, 
  MdSettings, 
  MdShoppingCart, 
  MdNotifications 
} from "react-icons/md";

const RadixUIShowcasePage = () => {
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [sliderValue, setSliderValue] = useState([50]);
  const [progressValue, setProgressValue] = useState(30);

  const handleToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <Toast.Provider swipeDirection="right">
      <Tooltip.Provider>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Radix UI + Tailwind CSS Showcase
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our beautiful, accessible UI components built with Radix UI primitives 
                and styled with Tailwind CSS for your medical marketplace.
              </p>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Buttons Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Enhanced Buttons</h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="icon-sm">
                      <MdSettings className="h-3 w-3" />
                    </Button>
                    <Button size="icon">
                      <MdSettings className="h-4 w-4" />
                    </Button>
                    <Button size="icon-lg">
                      <MdSettings className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button loading>Loading Button</Button>
                    <Button variant="primary" loading>Loading Primary</Button>
                    <Button disabled>Disabled Button</Button>
                    <Button ripple={false} variant="outline">No Ripple</Button>
                  </div>
                </div>
              </div>

              {/* Advanced Button Showcase */}
              <ButtonShowcase />

              {/* Dialog Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Dialog</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right text-sm font-medium">
                          Name
                        </label>
                        <input
                          id="name"
                          defaultValue="Dr. John Smith"
                          className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="specialty" className="text-right text-sm font-medium">
                          Specialty
                        </label>
                        <input
                          id="specialty"
                          defaultValue="Cardiology"
                          className="col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Dropdown Menu Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Dropdown Menu</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-between">
                      User Menu
                      <MdKeyboardArrowDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <MdPerson className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdShoppingCart className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdSettings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MdNotifications className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Toast Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Toast</h2>
                <Button onClick={handleToast}>Show Toast</Button>
                <Toast.Root
                  className={`bg-white rounded-md shadow-lg border p-4 transition-transform transform ${
                    showToast ? 'translate-x-0' : 'translate-x-full'
                  }`}
                  open={showToast}
                  onOpenChange={setShowToast}
                >
                  <Toast.Title className="font-semibold text-gray-900">
                    Order Confirmed!
                  </Toast.Title>
                  <Toast.Description className="text-gray-600 mt-1">
                    Your medical equipment order has been confirmed.
                  </Toast.Description>
                  <Toast.Action className="mt-2" asChild altText="Close">
                    <Button size="sm" variant="outline">
                      Close
                    </Button>
                  </Toast.Action>
                </Toast.Root>
                <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50" />
              </div>

              {/* Form Controls Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Form Controls</h2>
                <div className="space-y-6">
                  {/* Switch */}
                  <div className="flex items-center space-x-2">
                    <Switch.Root
                      className="w-11 h-6 bg-gray-200 rounded-full relative shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=checked]:bg-blue-600"
                      checked={switchChecked}
                      onCheckedChange={setSwitchChecked}
                    >
                      <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform data-[state=checked]:translate-x-5" />
                    </Switch.Root>
                    <label className="text-sm font-medium">Email notifications</label>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox.Root
                      className="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      checked={checkboxChecked}
                      onCheckedChange={setCheckboxChecked}
                    >
                      <Checkbox.Indicator className="text-white">
                        <MdCheck className="h-3 w-3" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label className="text-sm font-medium">I agree to the terms and conditions</label>
                  </div>

                  {/* Radio Group */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Delivery Option</label>
                    <RadioGroup.Root
                      className="flex flex-col gap-2"
                      value={radioValue}
                      onValueChange={setRadioValue}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroup.Item
                          className="h-4 w-4 rounded-full border border-gray-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          value="option1"
                        >
                          <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white" />
                        </RadioGroup.Item>
                        <label className="text-sm">Standard Delivery (5-7 days)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroup.Item
                          className="h-4 w-4 rounded-full border border-gray-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          value="option2"
                        >
                          <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-white" />
                        </RadioGroup.Item>
                        <label className="text-sm">Express Delivery (2-3 days)</label>
                      </div>
                    </RadioGroup.Root>
                  </div>
                </div>
              </div>

              {/* Progress & Slider Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Progress & Slider</h2>
                <div className="space-y-6">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Order Processing</span>
                      <span>{progressValue}%</span>
                    </div>
                    <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-2">
                      <Progress.Indicator
                        className="bg-blue-600 w-full h-full transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${100 - progressValue}%)` }}
                      />
                    </Progress.Root>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>
                        -10
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
                        +10
                      </Button>
                    </div>
                  </div>

                  {/* Slider */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price Range: ${sliderValue[0]}
                    </label>
                    <Slider.Root
                      className="relative flex items-center select-none touch-none w-full h-5"
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={1000}
                      min={0}
                      step={10}
                    >
                      <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
                        <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-5 h-5 bg-white shadow-lg border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </Slider.Root>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                <h2 className="text-2xl font-semibold mb-4">Tabs</h2>
                <Tabs.Root className="w-full" defaultValue="tab1">
                  <Tabs.List className="flex border-b border-gray-200">
                    <Tabs.Trigger
                      className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
                      value="tab1"
                    >
                      Product Details
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
                      value="tab2"
                    >
                      Specifications
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
                      value="tab3"
                    >
                      Reviews
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content className="pt-4" value="tab1">
                    <div className="prose max-w-none">
                      <h3>Digital Stethoscope</h3>
                      <p>
                        Advanced digital stethoscope with noise cancellation and wireless connectivity. 
                        Perfect for modern medical practices requiring high-quality sound amplification.
                      </p>
                    </div>
                  </Tabs.Content>
                  <Tabs.Content className="pt-4" value="tab2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Weight:</strong> 200g
                      </div>
                      <div>
                        <strong>Battery Life:</strong> 12 hours
                      </div>
                      <div>
                        <strong>Frequency Range:</strong> 20Hz - 20kHz
                      </div>
                      <div>
                        <strong>Connectivity:</strong> Bluetooth 5.0
                      </div>
                    </div>
                  </Tabs.Content>
                  <Tabs.Content className="pt-4" value="tab3">
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <Avatar.Root className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            <Avatar.Image className="w-full h-full object-cover rounded-full" src="" alt="" />
                            <Avatar.Fallback className="text-sm font-medium">JS</Avatar.Fallback>
                          </Avatar.Root>
                          <span className="ml-2 font-medium">Dr. Jane Smith</span>
                        </div>
                        <p className="text-gray-600">
                          Excellent quality stethoscope. The sound clarity is remarkable and the wireless 
                          feature is very convenient during patient rounds.
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <Avatar.Root className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            <Avatar.Image className="w-full h-full object-cover rounded-full" src="" alt="" />
                            <Avatar.Fallback className="text-sm font-medium">MB</Avatar.Fallback>
                          </Avatar.Root>
                          <span className="ml-2 font-medium">Dr. Michael Brown</span>
                        </div>
                        <p className="text-gray-600">
                          Great investment for any medical professional. The battery life is excellent 
                          and the build quality feels very durable.
                        </p>
                      </div>
                    </div>
                  </Tabs.Content>
                </Tabs.Root>
              </div>

              {/* Accordion Section */}
              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                <h2 className="text-2xl font-semibold mb-4">Accordion</h2>
                <Accordion.Root className="w-full" type="single" collapsible>
                  <Accordion.Item className="border-b" value="item-1">
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full justify-between py-4 text-left font-medium hover:text-blue-600 transition-colors">
                        Shipping Information
                        <MdKeyboardArrowDown className="h-4 w-4 transform transition-transform group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pb-4 text-gray-600">
                      We offer free shipping on orders over $200. Standard delivery takes 5-7 business days, 
                      while express delivery is available for urgent orders and takes 2-3 business days.
                    </Accordion.Content>
                  </Accordion.Item>
                  
                  <Accordion.Item className="border-b" value="item-2">
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full justify-between py-4 text-left font-medium hover:text-blue-600 transition-colors">
                        Return Policy
                        <MdKeyboardArrowDown className="h-4 w-4 transform transition-transform group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pb-4 text-gray-600">
                      All medical equipment can be returned within 30 days of purchase if unused and in 
                      original packaging. Please note that some specialized equipment may have different return policies.
                    </Accordion.Content>
                  </Accordion.Item>
                  
                  <Accordion.Item value="item-3">
                    <Accordion.Header>
                      <Accordion.Trigger className="flex w-full justify-between py-4 text-left font-medium hover:text-blue-600 transition-colors">
                        Warranty Information
                        <MdKeyboardArrowDown className="h-4 w-4 transform transition-transform group-data-[state=open]:rotate-180" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="pb-4 text-gray-600">
                      Most products come with a manufacturer's warranty ranging from 1-3 years. 
                      Extended warranty options are available for premium equipment.
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>

              {/* Tooltip & Avatar Section */}
              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                <h2 className="text-2xl font-semibold mb-4">Tooltips & Avatars</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Avatar.Root className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                          <Avatar.Image className="w-full h-full object-cover rounded-full" src="" alt="Dr. Smith" />
                          <Avatar.Fallback className="text-lg font-medium text-blue-700">DS</Avatar.Fallback>
                        </Avatar.Root>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-900 text-white px-2 py-1 rounded text-sm"
                          sideOffset={5}
                        >
                          Dr. Sarah Smith - Cardiologist
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>

                    <Separator.Root className="bg-gray-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px" orientation="vertical" decorative style={{ height: '40px' }} />

                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Button variant="outline" size="icon">
                          <MdShoppingCart className="h-4 w-4" />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-900 text-white px-2 py-1 rounded text-sm"
                          sideOffset={5}
                        >
                          Add to cart
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">Hover over elements to see tooltips</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-gray-600">
                All components are fully accessible and ready for production use in your medical marketplace.
              </p>
            </div>
          </div>
        </div>
      </Tooltip.Provider>
    </Toast.Provider>
  );
};

export default RadixUIShowcasePage;
