import React from 'react';

interface BagIconProps {
  className?: string;
  style?: React.CSSProperties;
  stroke?: string;
}

const BagIcon: React.FC<BagIconProps> = ({
  className,
  style,
  stroke = 'currentColor', // uses surrounding text color by default
}) => (
  <svg
  width="100%"
  height="100%"
  viewBox="0 0 28 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path d="M9.51422 12.6777L22.3053 25.35" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M17.7877 13.3584L24.8125 20.3055" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M24.4986 13.333L25.735 15.2582" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M1.6236 12L15.3218 25.5802" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M3.00641 19.9658L8.97656 25.8845" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M18.0015 12.833L4.99615 25.8359" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M10.0025 12.833L2.83942 19.9998" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M2.9986 14L1.9986 15" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M25.9858 12L12.0022 25.9872" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M24.5937 19.9658L18.6236 25.8845" stroke={stroke} strokeOpacity="0.6" strokeMiterlimit="10" />
    <path d="M22.0661 9.22009V8.8288C22.0661 6.78027 21.2601 4.8534 19.8041 3.4066C18.3414 1.96309 16.3978 1.16406 14.3314 1.16406C10.0694 1.16406 6.6001 4.60349 6.6001 8.8288V9.22009" stroke={stroke} strokeMiterlimit="10" />
    <path d="M3.09516 9.20068C2.39201 9.20068 0.996094 9.49976 0.996094 10.4998C0.996094 11.9998 1.65569 12.0351 1.81158 12.7157L3.67559 24.0205C3.91771 25.0563 4.21954 25.7797 5.91108 25.7797H22.1134C23.6557 25.7797 24.1035 25.0563 24.3489 24.0205L26.0637 12.2587C26.2229 11.578 26.7237 11.4375 26.7237 10.4998C26.7237 9.56197 25.6325 9.20068 24.9293 9.20068H3.09516Z" stroke={stroke} strokeMiterlimit="10" />
    <path d="M1.70172 12L26.2017 12" stroke={stroke} strokeMiterlimit="10" />
  </svg>
);

export default BagIcon;
