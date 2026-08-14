'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import Rose, { FlowerRef } from './Rose';
import Tulip from './Tulip';
import Lily from './Lily';
import Sunflower from './Sunflower';
import Orchid from './Orchid';
import Daisy from './Daisy';
import Lotus from './Lotus';
import Lavender from './Lavender';
import { FlowerType } from '@/store/useStore';

interface FlowerFactoryProps {
  type: FlowerType;
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const FlowerFactory = forwardRef<FlowerRef, FlowerFactoryProps>(({ 
  type,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  ...props
}, ref) => {
  const bouquetStemRef = useRef<FlowerRef>(null);
  const outerGroupRef = useRef<THREE.Group>(null!);

  // Each flower animates a gentle sway on its own group.  This outer group
  // preserves the bouquet's intentional lean toward its centre.
  useImperativeHandle(ref, () => ({
    group: outerGroupRef.current,
    setBloom: (t) => bouquetStemRef.current?.setBloom(t),
    setStemGrow: (t) => bouquetStemRef.current?.setStemGrow(t),
  }));

  const flowerProps = {
    ...props,
    ref: bouquetStemRef,
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  };

  let flower: ReactNode;
  switch (type) {
    case 'rose':
      flower = <Rose {...flowerProps} />;
      break;
    case 'tulip':
      flower = <Tulip {...flowerProps} />;
      break;
    case 'lily':
      flower = <Lily {...flowerProps} />;
      break;
    case 'sunflower':
      flower = <Sunflower {...flowerProps} />;
      break;
    case 'orchid':
      flower = <Orchid {...flowerProps} />;
      break;
    case 'daisy':
      flower = <Daisy {...flowerProps} />;
      break;
    case 'lotus':
      flower = <Lotus {...flowerProps} />;
      break;
    case 'lavender':
      flower = <Lavender {...flowerProps} />;
      break;
    default:
      flower = <Rose {...flowerProps} />;
  }

  return (
    <group ref={outerGroupRef} position={position} rotation={rotation}>
      {flower}
    </group>
  );
});

FlowerFactory.displayName = 'FlowerFactory';
export default FlowerFactory;
export type { FlowerRef };
