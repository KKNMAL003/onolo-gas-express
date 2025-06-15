
import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentMethodSectionProps {
  paymentMethod: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  paymentMethod,
  onChange
}) => {
  return (
    <div className="bg-onolo-dark-lighter rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="paymentMethod"
            value="eft"
            checked={paymentMethod === 'eft'}
            onChange={onChange}
            className="text-onolo-orange"
          />
          <span>EFT (Electronic Funds Transfer)</span>
        </label>
        
        <label className="flex items-center space-x-3 opacity-50">
          <input
            type="radio"
            name="paymentMethod"
            value="card"
            disabled
            className="text-onolo-orange"
          />
          <span>Credit/Debit Card (Currently Unavailable)</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="paymentMethod"
            value="payfast"
            checked={paymentMethod === 'payfast'}
            onChange={onChange}
            className="text-onolo-orange"
          />
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            <span>PayFast (South African Payment Gateway)</span>
          </div>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="paymentMethod"
            value="paypal"
            checked={paymentMethod === 'paypal'}
            onChange={onChange}
            className="text-onolo-orange"
          />
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            <span>PayPal (Secure Online Payment)</span>
          </div>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="radio"
            name="paymentMethod"
            value="cash_on_delivery"
            checked={paymentMethod === 'cash_on_delivery'}
            onChange={onChange}
            className="text-onolo-orange"
          />
          <span>Cash on Delivery</span>
        </label>
      </div>

      {paymentMethod === 'eft' && (
        <div className="mt-4 p-4 bg-onolo-dark rounded-xl border border-onolo-orange">
          <h3 className="text-onolo-orange font-semibold mb-3">ABSA Banking Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-onolo-gray">Bank:</span>
              <span>ABSA Bank</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onolo-gray">Account Name:</span>
              <span>Onolo Group (Pty) Ltd</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onolo-gray">Account Number:</span>
              <span>4073134909</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onolo-gray">Branch:</span>
              <span>Business Commercial West Rand</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onolo-gray">Reference:</span>
              <span>Your Order Number</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-onolo-orange bg-opacity-10 rounded-lg">
            <p className="text-xs text-onolo-orange">
              <strong>Important:</strong> Delivery will be processed once proof of payment (POP) is sent to:<br />
              <strong>Email:</strong> info@onologroup.com<br />
              <strong>WhatsApp:</strong> 071 770 3063<br />
              Please include your order number as reference.
            </p>
          </div>
        </div>
      )}

      {paymentMethod === 'payfast' && (
        <div className="mt-4 p-4 bg-onolo-dark rounded-xl border border-onolo-orange">
          <h3 className="text-onolo-orange font-semibold mb-3">PayFast Payment</h3>
          <div className="space-y-2 text-sm">
            <p className="text-onolo-gray">
              You'll be redirected to PayFast to complete your payment securely.
            </p>
            <p className="text-xs text-onolo-gray">
              PayFast supports all major South African banks and payment methods including EFT, credit cards, and instant payments.
            </p>
            <p className="text-xs text-yellow-400">
              <strong>Note:</strong> Currently in test mode. Use PayFast's test payment methods.
            </p>
          </div>
        </div>
      )}

      {paymentMethod === 'paypal' && (
        <div className="mt-4 p-4 bg-onolo-dark rounded-xl border border-onolo-orange">
          <h3 className="text-onolo-orange font-semibold mb-3">PayPal Payment</h3>
          <div className="space-y-2 text-sm">
            <p className="text-onolo-gray">
              You'll be redirected to PayPal to complete your payment securely.
            </p>
            <p className="text-xs text-onolo-gray">
              PayPal supports all major credit cards and bank transfers.
            </p>
            <p className="text-xs text-yellow-400">
              <strong>Note:</strong> Currently using sandbox mode for testing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSection;
