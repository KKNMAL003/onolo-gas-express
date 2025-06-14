
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface MenuSection {
  title: string;
  items: Array<{
    label: string;
    content: React.ReactNode;
  }>;
}

const Menu = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedContent, setSelectedContent] = useState<React.ReactNode | null>(null);

  const menuSections: MenuSection[] = [
    {
      title: "Customer Info",
      items: [
        {
          label: "About Us",
          content: (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-onolo-orange">About Onolo Group</h2>
              <p className="text-onolo-gray leading-relaxed">
                Onolo Group combines online retail with wholesale and logistics services, offering a seamless experience for LPG and petroleum product customers. Our business model emphasizes convenience, safety, efficiency, and competitive pricing, serving residential, commercial, and industrial clients.
              </p>
              <div className="space-y-2">
                <p><strong>Registration Number:</strong> 2008/00923/07</p>
                <p><strong>Tax Number:</strong> 9496381162</p>
              </div>
            </div>
          )
        },
        {
          label: "Contact Us",
          content: (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-onolo-orange">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-white">Primary Address</h3>
                  <p className="text-onolo-gray">308 Knoppieslaagte Farm, Meerkat Rd, Timsrand AH, Centurion, South Africa</p>
                  <p className="text-onolo-gray">GPS: -25.929083, 28.063143</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Secondary Address</h3>
                  <p className="text-onolo-gray">Cambridge Manor, c/o Witkoppen and Stonehaven, Manor 4, First Floor, Paulshof</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Contact Details</h3>
                  <p className="text-onolo-gray">Phone: +27 11 464 5073</p>
                  <p className="text-onolo-gray">Fax: +27 86 520 9018</p>
                  <p className="text-onolo-gray">Email: info@onologroup.com</p>
                  <p className="text-onolo-gray">Website: www.onologroup.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Banking Details</h3>
                  <p className="text-onolo-gray">ABSA Business Commercial West Rand</p>
                  <p className="text-onolo-gray">Account No: 4073134909</p>
                </div>
              </div>
            </div>
          )
        },
        {
          label: "Delivery",
          content: (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-onolo-orange">Delivery Information</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-white">Service Areas</h3>
                  <p className="text-onolo-gray">We deliver throughout Johannesburg and surrounding areas in South Africa.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Delivery Times</h3>
                  <p className="text-onolo-gray">• Standard Delivery: 1-2 working days</p>
                  <p className="text-onolo-gray">• Same-day delivery available for selected areas</p>
                  <p className="text-onolo-gray">• Operating Hours: 7 AM to 10 PM</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Important Notes</h3>
                  <p className="text-onolo-gray">• LPG refills require an exchange cylinder</p>
                  <p className="text-onolo-gray">• Deposits charged if no exchange cylinder available</p>
                  <p className="text-onolo-gray">• All deliveries comply with safety regulations</p>
                </div>
              </div>
            </div>
          )
        },
        {
          label: "Gas Safety Tips",
          content: (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-onolo-orange">Gas Safety Tips</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-white">Storage Safety</h3>
                  <ul className="text-onolo-gray space-y-1">
                    <li>• Store cylinders upright in well-ventilated areas</li>
                    <li>• Keep away from heat sources and direct sunlight</li>
                    <li>• Never store indoors or in enclosed spaces</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Usage Safety</h3>
                  <ul className="text-onolo-gray space-y-1">
                    <li>• Check connections for leaks regularly</li>
                    <li>• Use soapy water to detect leaks</li>
                    <li>• Turn off gas when not in use</li>
                    <li>• Ensure good ventilation during use</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Emergency</h3>
                  <ul className="text-onolo-gray space-y-1">
                    <li>• If you smell gas, turn off supply immediately</li>
                    <li>• Ventilate the area</li>
                    <li>• No smoking or open flames</li>
                    <li>• Contact emergency services if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  if (selectedContent) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Information</h1>
            <button
              onClick={() => setSelectedContent(null)}
              className="w-10 h-10 bg-onolo-orange rounded-full flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            {selectedContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Menu</h1>
          <button className="w-10 h-10 bg-onolo-orange rounded-full flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>

        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h2 className="text-xl font-bold text-onolo-orange mb-4">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => setSelectedContent(item.content)}
                  className="w-full text-left flex items-center space-x-3 py-3 hover:bg-onolo-dark-lighter rounded-lg transition-colors"
                >
                  <div className="w-2 h-2 bg-onolo-orange rounded-full"></div>
                  <span className="text-onolo-gray">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 space-y-2">
          <h3 className="text-lg font-bold">Contact</h3>
          <p className="text-onolo-gray">Onolo Group (Pty) Ltd</p>
          <p className="text-onolo-gray">308 Knoppieslaagte Farm, Meerkat Rd,</p>
          <p className="text-onolo-gray">Timsrand AH, Centurion</p>
          <p className="text-onolo-orange font-semibold">info@onologroup.com</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
