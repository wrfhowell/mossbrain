import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

function Wizard() {
  const { scene } = useGLTF("/wizard-compressed.glb", true);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const ref = useRef<THREE.Group>(null!);
  const { camera } = useThree();

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clone);
    const bSize = box.getSize(new THREE.Vector3());
    // Use the diagonal so the model fits even at its widest rotation angle
    const diagonal = Math.sqrt(bSize.x ** 2 + bSize.y ** 2 + bSize.z ** 2);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const dist = diagonal / (2 * Math.tan(fov / 2)) * 1.2;
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [clone, camera]);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.35;
  });

  return (
    <Center>
      <primitive ref={ref} object={clone} />
    </Center>
  );
}

useGLTF.preload("/wizard-compressed.glb", true);

interface Props {
  size?: number;
  aspect?: number;
}

export default function WizardModel({ size = 88, aspect = 1.4 }: Props) {
  return (
    <div style={{ width: size * aspect, height: size, margin: "0 auto", flexShrink: 0 }}>
      <Canvas
        style={{ pointerEvents: "none" }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 2]} />
        <Suspense fallback={null}>
          <Wizard />
        </Suspense>
      </Canvas>
    </div>
  );
}
