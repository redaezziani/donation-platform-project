import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

const AnimatedCurrency = ({ value, duration = 2 }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value || 0);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(Math.floor(latest));
        ref.current.textContent = formatted;
      }
    });
  }, [springValue]);

  // Set initial value to $0
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = "0";
    }
  }, []);

  return <span
  className="text-shadow-md"
  ref={ref}>0</span>;
};

export default AnimatedCurrency;