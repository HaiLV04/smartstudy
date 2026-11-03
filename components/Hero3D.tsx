'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 18;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x0ea5a4, 4, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x818cf8, 4, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Group for objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(3, 0.85, 128, 32);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    mainGroup.add(knotMesh);

    // 2. Surrounding Floating Polyhedrons & Gems
    const gems: THREE.Mesh[] = [];
    const colors = [0x0ea5a4, 0xf59e0b, 0xec4899, 0x10b981, 0x38bdf8];

    for (let i = 0; i < 20; i++) {
      const geo = i % 2 === 0 
        ? new THREE.IcosahedronGeometry(0.5 + Math.random() * 0.5, 0)
        : new THREE.OctahedronGeometry(0.5 + Math.random() * 0.4, 0);

      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.1,
        metalness: 0.9,
      });

      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 20) * Math.PI * 2;
      const radius = 7 + (i % 3) * 2;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 6,
        Math.sin(angle) * radius
      );
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.03,
        rotSpeedY: (Math.random() - 0.5) * 0.03,
        orbitSpeed: 0.005 + Math.random() * 0.005,
        radius,
        angle
      };
      gems.push(mesh);
      mainGroup.add(mesh);
    }

    // 3. Floating Star Particles
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 50;
      starPositions[i + 1] = (Math.random() - 0.5) * 30;
      starPositions[i + 2] = (Math.random() - 0.5) * 30;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.8
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) * 0.001;
      mouseY = (e.clientY - windowHalfY) * 0.001;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Resize
    const onResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      mainGroup.rotation.y += 0.008;
      mainGroup.rotation.x = targetY * 2;
      mainGroup.rotation.z = targetX * 1.5;

      knotMesh.rotation.x += 0.01;
      knotMesh.rotation.y += 0.012;

      // Animate gems orbiting
      gems.forEach(g => {
        g.rotation.x += g.userData.rotSpeedX;
        g.rotation.y += g.userData.rotSpeedY;
        g.userData.angle += g.userData.orbitSpeed;
        g.position.x = Math.cos(g.userData.angle) * g.userData.radius;
        g.position.z = Math.sin(g.userData.angle) * g.userData.radius;
      });

      starField.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
    />
  );
}
