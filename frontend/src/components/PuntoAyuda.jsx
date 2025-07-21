import { HelpCircle } from 'lucide-react';
import PropTypes from 'prop-types';

export default function HelpTooltip({ children, className = '' }) {
  return (
    <div className="relative group inline-block">
      <HelpCircle
        className={`w-5 h-5 text-white hover:text-yellow-300 cursor-pointer transition-colors duration-200 ${className}`}
      />
      <div className="absolute z-50 hidden group-hover:block bg-white border border-gray-300 shadow-lg rounded-lg p-3 text-sm w-64 left-1/2 -translate-x-1/2 top-full mt-2 text-left">
        {children}
      </div>
    </div>
  );
}

HelpTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
