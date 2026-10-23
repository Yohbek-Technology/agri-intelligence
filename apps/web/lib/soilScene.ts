import * as THREE from 'three'
import type { SoilClass, DrainageClass, AgroZone } from '@repo/shared'

export interface SoilSceneOptions {
  soilClass: SoilClass
  drainage: DrainageClass
  agroZone: AgroZone
  elevationMeters?: number
}

// Procedural texture generators for realistic Ethiopian soil strata
function createTopsoilTexture(soilClass: SoilClass): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Base fill
  let baseColor = '#423325'
  let speckleColor = '#2B1E13'
  let accentColor = '#594432'

  if (soilClass === 'koticha_vertisol') {
    // Charcoal-black heavy cracking clay
    baseColor = '#1F1E1D'
    speckleColor = '#141413'
    accentColor = '#2F2E2C'
  } else if (soilClass === 'beda_nitisol') {
    // Deep terracotta-red weathered loam
    baseColor = '#8A3C23'
    speckleColor = '#602513'
    accentColor = '#B25434'
  } else if (soilClass === 'sandy') {
    baseColor = '#C2A374'
    speckleColor = '#8E7145'
    accentColor = '#D9BF96'
  } else if (soilClass === 'clay') {
    baseColor = '#5C4033'
    speckleColor = '#3B2920'
    accentColor = '#7A5745'
  } else if (soilClass === 'loam') {
    baseColor = '#3B2D21'
    speckleColor = '#241B13'
    accentColor = '#544130'
  }

  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, 512, 512)

  // Granular speckle noise
  for (let i = 0; i < 28000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    ctx.fillStyle = Math.random() > 0.5 ? speckleColor : accentColor
    ctx.fillRect(x, y, 1.5, 1.5)
  }

  // Cracking fissures for Koticha Vertisol
  if (soilClass === 'koticha_vertisol') {
    ctx.strokeStyle = '#0F0F0E'
    ctx.lineWidth = 1.8
    for (let c = 0; c < 14; c++) {
      ctx.beginPath()
      let cx = Math.random() * 512
      let cy = Math.random() * 512
      ctx.moveTo(cx, cy)
      for (let s = 0; s < 5; s++) {
        cx += (Math.random() - 0.5) * 80
        cy += (Math.random() - 0.5) * 80
        ctx.lineTo(cx, cy)
      }
      ctx.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

export class SoilScene {
  private container: HTMLElement
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private animFrameId: number | null = null

  // Meshes
  private soilGroup: THREE.Group
  private topsoilMesh!: THREE.Mesh
  private subsoilMesh!: THREE.Mesh
  private regolithMesh!: THREE.Mesh
  private bedrockMesh!: THREE.Mesh
  private waterPoolMesh!: THREE.Mesh
  private rainParticles!: THREE.Points
  private backdropMesh!: THREE.Mesh

  // Interaction
  private isDragging = false
  private prevMousePos = { x: 0, y: 0 }
  private targetRotation = { x: 0.35, y: -0.55 }
  private currentRotation = { x: 0.35, y: -0.55 }
  private currentZoom = 1.0

  private options: SoilSceneOptions

  constructor(container: HTMLElement, options: SoilSceneOptions) {
    this.container = container
    this.options = options

    const width = container.clientWidth || 400
    const height = container.clientHeight || 340

    // 1. Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#FAF8F4')

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    this.camera.position.set(0, 1.8, 5.0)

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this.renderer.domElement)

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    this.scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xfff3db, 2.0)
    dirLight.position.set(5, 8, 4)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    this.scene.add(dirLight)

    const fillLight = new THREE.DirectionalLight(0xbad2e8, 0.7)
    fillLight.position.set(-4, 3, -3)
    this.scene.add(fillLight)

    // 5. Construct Objects
    this.soilGroup = new THREE.Group()
    this.scene.add(this.soilGroup)

    this.createStratumLayers()
    this.createDrainageSystem()
    this.createElevationBackdrop()

    // 6. Event Listeners
    this.setupInteractions()
    this.startAnimationLoop()
  }

  private createStratumLayers() {
    const width = 2.4
    const depth = 2.4

    // Layer heights:
    // Topsoil: 0.45
    // Subsoil: 0.65
    // Regolith: 0.50
    // Bedrock: 0.40

    // Topsoil
    const topTexture = createTopsoilTexture(this.options.soilClass)
    const topMat = new THREE.MeshStandardMaterial({
      map: topTexture,
      roughness: this.options.drainage === 'waterlogs' ? 0.2 : 0.85,
      metalness: this.options.drainage === 'waterlogs' ? 0.35 : 0.05,
    })
    const topGeo = new THREE.BoxGeometry(width, 0.45, depth)
    this.topsoilMesh = new THREE.Mesh(topGeo, topMat)
    this.topsoilMesh.position.y = 0.6
    this.topsoilMesh.castShadow = true
    this.topsoilMesh.receiveShadow = true
    this.soilGroup.add(this.topsoilMesh)

    // Subsoil / Horizon B (Clay / Illuvial concentration)
    const subColor =
      this.options.soilClass === 'beda_nitisol'
        ? 0x6e2b17
        : this.options.soilClass === 'koticha_vertisol'
        ? 0x2b2927
        : 0x4a3627
    const subMat = new THREE.MeshStandardMaterial({
      color: subColor,
      roughness: 0.9,
    })
    const subGeo = new THREE.BoxGeometry(width, 0.65, depth)
    this.subsoilMesh = new THREE.Mesh(subGeo, subMat)
    this.subsoilMesh.position.y = 0.05
    this.subsoilMesh.castShadow = true
    this.subsoilMesh.receiveShadow = true
    this.soilGroup.add(this.subsoilMesh)

    // Regolith / Horizon C (Weathered Rock Fragments)
    const regMat = new THREE.MeshStandardMaterial({
      color: 0x615c54,
      roughness: 0.95,
    })
    const regGeo = new THREE.BoxGeometry(width, 0.5, depth)
    this.regolithMesh = new THREE.Mesh(regGeo, regMat)
    this.regolithMesh.position.y = -0.52
    this.regolithMesh.castShadow = true
    this.regolithMesh.receiveShadow = true
    this.soilGroup.add(this.regolithMesh)

    // Bedrock / Horizon R (Solid basalt / volcanic shield)
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x2e2f33,
      roughness: 0.8,
    })
    const bedGeo = new THREE.BoxGeometry(width, 0.4, depth)
    this.bedrockMesh = new THREE.Mesh(bedGeo, bedMat)
    this.bedrockMesh.position.y = -0.97
    this.bedrockMesh.castShadow = true
    this.bedrockMesh.receiveShadow = true
    this.soilGroup.add(this.bedrockMesh)
  }

  private createDrainageSystem() {
    // Water pooling plane on top for waterlogged soil
    const poolGeo = new THREE.PlaneGeometry(2.38, 2.38)
    const poolMat = new THREE.MeshStandardMaterial({
      color: 0x2b5278,
      transparent: true,
      opacity: this.options.drainage === 'waterlogs' ? 0.65 : 0.0,
      roughness: 0.05,
      metalness: 0.8,
    })
    this.waterPoolMesh = new THREE.Mesh(poolGeo, poolMat)
    this.waterPoolMesh.rotation.x = -Math.PI / 2
    this.waterPoolMesh.position.y = 0.826
    this.soilGroup.add(this.waterPoolMesh)

    // Infiltration particles
    const particleCount = this.options.drainage === 'free_draining' ? 120 : 45
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2.2
      positions[i * 3 + 1] = Math.random() * 1.6 - 0.8
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.2
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0x4fa3e3,
      size: 0.045,
      transparent: true,
      opacity: this.options.drainage === 'waterlogs' ? 0.2 : 0.85,
    })

    this.rainParticles = new THREE.Points(particleGeo, particleMat)
    this.soilGroup.add(this.rainParticles)
  }

  private createElevationBackdrop() {
    // Mountain backdrop tailored to Agro-climatic zone
    const backdropGeo = new THREE.PlaneGeometry(10, 4.5, 32, 16)
    const pos = backdropGeo.attributes.position as THREE.BufferAttribute

    // Modulate vertex heights to create stylized highland silhouette
    const isDega = this.options.agroZone === 'dega'
    const isKolla = this.options.agroZone === 'kolla'

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i)
      const v = pos.getY(i)
      if (v > -1.0) {
        const peakHeight = isDega ? 1.6 : isKolla ? 0.5 : 1.1
        const ridge = Math.sin(u * 1.2) * 0.6 + Math.cos(u * 2.8) * 0.35
        pos.setZ(i, ridge * peakHeight)
      }
    }
    backdropGeo.computeVertexNormals()

    const backdropColor = isDega ? 0x6e7b8b : isKolla ? 0xb58957 : 0x476a45
    const backdropMat = new THREE.MeshStandardMaterial({
      color: backdropColor,
      roughness: 0.9,
      flatShading: true,
    })

    this.backdropMesh = new THREE.Mesh(backdropGeo, backdropMat)
    this.backdropMesh.position.set(0, 0.8, -3.2)
    this.scene.add(this.backdropMesh)
  }

  public updateOptions(newOptions: Partial<SoilSceneOptions>) {
    this.options = { ...this.options, ...newOptions }

    // Update topsoil texture and material properties
    if (newOptions.soilClass) {
      const newTex = createTopsoilTexture(this.options.soilClass)
      ;(this.topsoilMesh.material as THREE.MeshStandardMaterial).map = newTex
      ;(this.topsoilMesh.material as THREE.MeshStandardMaterial).needsUpdate = true

      const subColor =
        this.options.soilClass === 'beda_nitisol'
          ? 0x6e2b17
          : this.options.soilClass === 'koticha_vertisol'
          ? 0x2b2927
          : 0x4a3627
      ;(this.subsoilMesh.material as THREE.MeshStandardMaterial).color.setHex(subColor)
    }

    if (newOptions.drainage) {
      const isWaterlogging = this.options.drainage === 'waterlogs'
      const poolMat = this.waterPoolMesh.material as THREE.MeshStandardMaterial
      poolMat.opacity = isWaterlogging ? 0.65 : 0.0

      const topMat = this.topsoilMesh.material as THREE.MeshStandardMaterial
      topMat.roughness = isWaterlogging ? 0.2 : 0.85
      topMat.metalness = isWaterlogging ? 0.35 : 0.05
    }

    if (newOptions.agroZone) {
      const isDega = this.options.agroZone === 'dega'
      const isKolla = this.options.agroZone === 'kolla'
      const backdropColor = isDega ? 0x6e7b8b : isKolla ? 0xb58957 : 0x476a45
      ;(this.backdropMesh.material as THREE.MeshStandardMaterial).color.setHex(backdropColor)
    }
  }

  private setupInteractions() {
    const el = this.renderer.domElement

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      this.isDragging = true
      const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY
      this.prevMousePos = { x: clientX, y: clientY }
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return
      const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]!.clientY : e.clientY

      const deltaX = clientX - this.prevMousePos.x
      const deltaY = clientY - this.prevMousePos.y

      this.targetRotation.y += deltaX * 0.008
      this.targetRotation.x = Math.max(0.1, Math.min(0.9, this.targetRotation.x + deltaY * 0.006))

      this.prevMousePos = { x: clientX, y: clientY }
    }

    const onPointerUp = () => {
      this.isDragging = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      this.currentZoom = Math.max(0.7, Math.min(1.5, this.currentZoom + e.deltaY * 0.001))
      this.camera.position.z = 5.0 * this.currentZoom
    }

    el.addEventListener('mousedown', onPointerDown)
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)

    el.addEventListener('touchstart', onPointerDown, { passive: true })
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('touchend', onPointerUp)
    el.addEventListener('wheel', onWheel, { passive: false })
  }

  private startAnimationLoop() {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate)

      // Smooth rotation dampening
      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.1
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.1

      this.soilGroup.rotation.x = this.currentRotation.x
      this.soilGroup.rotation.y = this.currentRotation.y

      // Idle auto-rotation when not interacting
      if (!this.isDragging) {
        this.targetRotation.y += 0.0018
      }

      // Animate infiltration particles
      if (this.rainParticles) {
        const positions = this.rainParticles.geometry.attributes.position as THREE.BufferAttribute
        const speed = this.options.drainage === 'free_draining' ? 0.022 : 0.007

        for (let i = 0; i < positions.count; i++) {
          let y = positions.getY(i) - speed
          if (y < -1.1) {
            y = 0.8
          }
          positions.setY(i, y)
        }
        positions.needsUpdate = true
      }

      this.renderer.render(this.scene, this.camera)
    }

    animate()
  }

  public handleResize() {
    if (!this.container || !this.renderer) return
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    if (width === 0 || height === 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId)
    }
    this.renderer.dispose()
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }
}
