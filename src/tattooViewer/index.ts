import * as THREE from "three";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from "three-mesh-bvh";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import Stats from "stats.js";

import { computeTattooDefaultSize } from "../utils";

import walkerFbxUrl from "./walker.fbx?url";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

interface IConfig {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  onInitSuccess: () => void;
  activeTattooIdChange: (id?: string | null) => void;
}

interface ITattooInfo {
  id: string | number;
  canvas: HTMLCanvasElement;
  mesh: THREE.Mesh<DecalGeometry, THREE.MeshPhongMaterial>;
  outlineMesh: THREE.Mesh<DecalGeometry, THREE.MeshBasicMaterial>;
  size: THREE.Vector3;
  position: THREE.Vector3;
  orientation: THREE.Euler;
}

export default class TattooViewer {
  get activeTattooId() {
    return this._activeTattooId;
  }

  set activeTattooId(id: string | null) {
    this._activeTattooId = id;
    this._activeTattooIdChange(id);
  }

  private readonly _container!: HTMLElement;
  private readonly _canvas!: HTMLCanvasElement;

  private readonly _state = new Stats();

  private readonly _scene = new THREE.Scene();
  private _renderer!: THREE.WebGLRenderer;

  private _camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

  private _hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);

  private _dirLight = new THREE.DirectionalLight(0xffffff, 0.3);

  private _planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 5000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );

  private _controls!: OrbitControls;

  private _walkerMesh!: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>;

  private _tattooInfoMap = new Map<string, ITattooInfo>();

  private _activeTattooId: string | null = null;

  private _mouseHelper = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 180),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );

  private _raycaster = new THREE.Raycaster();

  private _activeTattooIdChange!: IConfig["activeTattooIdChange"];

  constructor({ container, canvas, onInitSuccess, activeTattooIdChange }: IConfig) {
    this._canvas = canvas;
    this._container = container;
    this._activeTattooIdChange = activeTattooIdChange;
    this.init().then(() => {
      // eslint-disable-next-line no-console
      console.log("初始化完成");

      this.bindEvent();
      onInitSuccess();
    });
  }

  private switchMouseHelperVisible = (visible: boolean) => {
    if (visible) {
      this._mouseHelper.visible = true;
      this._container.style.cursor = "none";
    } else {
      this._mouseHelper.visible = false;
      this._container.style.cursor = "inherit";
    }
  };

  private onRemoveTattoo = (id: string) => {
    const targetTattoo = this._tattooInfoMap.get(id);
    if (targetTattoo) {
      this._scene.remove(targetTattoo.mesh, targetTattoo.outlineMesh);
      this._tattooInfoMap.delete(id);
      this.activeTattooId = null;
    }
  };

  // private _eventLock = false;

  // 初始化
  private init = async () => {
    // 场景
    this._scene.background = new THREE.Color(0xe9e9e9);
    // this._scene.fog = new THREE.Fog(0xf2f2f2, 10, 50);
    // 相机
    this._camera.position.set(-1000, 2000, 3000);
    // 环境光
    this._hemiLight.position.set(0, 3000, 0);
    this._scene.add(this._hemiLight);

    // 方向光
    this._dirLight.position.set(3000, 3000, 2000);
    this._dirLight.castShadow = true;
    this._dirLight.shadow.camera.top = 2000;
    this._dirLight.shadow.camera.bottom = -2000;
    this._dirLight.shadow.camera.left = -2000;
    this._dirLight.shadow.camera.right = 2000;
    this._dirLight.shadow.camera.near = 0.1;
    this._dirLight.shadow.camera.far = 10000;
    this._scene.add(this._dirLight);

    // 地板
    this._planeMesh.rotation.x = -Math.PI / 2;
    this._planeMesh.receiveShadow = true;
    this._scene.add(this._planeMesh);

    // mouseHelper
    this._mouseHelper.visible = false;
    this._scene.add(this._mouseHelper);

    // 加载模特
    const loader = new FBXLoader();

    const fbxModel = await loader.loadAsync(walkerFbxUrl);

    this._scene.add(fbxModel);

    this._walkerMesh = fbxModel.children.find((object) => object instanceof THREE.Mesh)! as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshPhongMaterial
    >;

    this._walkerMesh.castShadow = true;

    this._walkerMesh.material.color.setHex(0xffdbac);

    this._walkerMesh.geometry.computeBoundsTree();

    // 计算法线
    this._walkerMesh.geometry.computeVertexNormals();

    // 渲染器
    this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas, antialias: true });
    this._renderer.shadowMap.enabled = true;
    this._renderer.setPixelRatio(window.devicePixelRatio);

    this._renderer.setSize(this._container.offsetWidth, this._container.offsetHeight);
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.shadowMap.enabled = true;
    this._container.appendChild(this._renderer.domElement);

    // 投射
    this._raycaster.firstHitOnly = true;
    // 控制器
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    // this._controls.enablePan = false;
    // this._controls.enableZoom = false;
    // this._controls.target.set(0, 1000, 0);
    this._controls.target.set(0, 1000, 0);

    this._controls.update();

    // stats
    this._state.dom.style.left = "auto";
    this._state.dom.style.right = "0";
    this._state.dom.style.top = "auto";
    this._state.dom.style.bottom = "0";
    this._container.appendChild(this._state.dom);

    // 开启动画
    this.animate();
  };

  // 捆绑拾取
  private bindEvent = () => {
    this._container.addEventListener("pointerdown", (e) => {});

    this._container.addEventListener("pointermove", this.onPointerMove);

    this._container.addEventListener("pointerup", (e) => {
      const intersects = this.getIntersectsByMouseEvent(e);

      if (this.activeTattooId) {
        const walkerIntersect = intersects.find((intersect) => intersect.object.uuid === this._walkerMesh.uuid);

        if (!walkerIntersect) {
          return;
        }

        this.onMoveActiveTattoo(walkerIntersect);
      } else {
        const tattooId = this.getPointedTattooIdFromIntersects(intersects);
        if (tattooId) {
          this.markTattooAsActive(tattooId);
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        this.clearActiveTattoo();
        return;
      }
      if (e.key === "Backspace") {
        if (this.activeTattooId) {
          this.onRemoveTattoo(this.activeTattooId);
        }
      }
    });

    window.addEventListener("resize", this.resize);
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    this._renderer.render(this._scene, this._camera);

    this._state.update();
  };

  private onPointerMove = (e: PointerEvent) => {
    const intersects = this.getIntersectsByMouseEvent(e);

    const walkerIntersect = intersects.find((intersect) => intersect.object.uuid === this._walkerMesh.uuid);

    if (walkerIntersect) {
      this.switchMouseHelperVisible(true);
      this.moveMouseHelper(walkerIntersect);
      if (!this.activeTattooId) {
        const tattooId = this.getPointedTattooIdFromIntersects(intersects);

        if (tattooId) {
          this.highLightPointedTattoo(tattooId);
        } else {
          this.clearPointedTattooHighLight();
        }
      }
    } else {
      this.switchMouseHelperVisible(false);
      this.clearPointedTattooHighLight();
    }
  };

  private highLightPointedTattoo = (id: string) => {
    this._tattooInfoMap.forEach((tattoo) => {
      if (tattoo.mesh.uuid === id) {
        tattoo.outlineMesh.visible = true;
        tattoo.outlineMesh.material.color.setHex(0x7fecad);
      } else {
        tattoo.outlineMesh.visible = false;
      }
    });
  };

  private clearPointedTattooHighLight = () => {
    this._tattooInfoMap.forEach((tattoo) => {
      if (tattoo.id !== this.activeTattooId) {
        tattoo.outlineMesh.visible = false;
      }
    });
  };

  private onMoveActiveTattoo = (walkerIntersect: THREE.Intersection) => {
    this.moveMouseHelper(walkerIntersect);

    // 移动纹身贴图
    const activeTattoo = this._tattooInfoMap.get(this.activeTattooId!)!;

    const tattooMesh = activeTattoo.mesh;
    const outlineMesh = activeTattoo.outlineMesh;

    tattooMesh.visible = true;
    outlineMesh.visible = true;

    const position = new THREE.Vector3().copy(walkerIntersect.point);

    const orientation = new THREE.Euler().copy(this._mouseHelper.rotation);

    const size = new THREE.Vector3().copy(activeTattoo.size);

    this.updateTattooMesh(activeTattoo, { position, size, orientation });
  };

  private updateTattooMesh = (
    tattoo: ITattooInfo,
    options: {
      position?: THREE.Vector3;
      orientation?: THREE.Euler;
      size?: THREE.Vector3;
    } = {}
  ) => {
    const tattooMesh = tattoo.mesh;
    const outlineMesh = tattoo.outlineMesh;
    const { position = tattoo.position, orientation = tattoo.orientation, size = tattoo.size } = options;

    const newDecalGeometry = new DecalGeometry(this._walkerMesh, position, orientation, size);

    tattooMesh.geometry = newDecalGeometry;

    // outlineMesh.visible = true;

    const outlineGeometry = new DecalGeometry(this._walkerMesh, position, orientation, new THREE.Vector3().copy(size));
    outlineMesh.geometry = outlineGeometry;

    tattoo.position = position;
    tattoo.orientation = orientation;
    tattoo.size = size;
  };

  private moveMouseHelper = (walkerIntersect: THREE.Intersection) => {
    this._mouseHelper.position.copy(walkerIntersect.point);
    const n = walkerIntersect.face!.normal.clone();
    n.transformDirection(this._walkerMesh.matrixWorld);
    n.multiplyScalar(10);
    n.add(walkerIntersect.point);

    this._mouseHelper.lookAt(n);
  };

  private getIntersectsByMouseEvent = (e: MouseEvent) => {
    const pointer = {
      x: (e.clientX / this._container.offsetWidth) * 2 - 1,
      y: -(e.clientY / this._container.offsetHeight) * 2 + 1,
    };

    this._raycaster.setFromCamera(pointer, this._camera);

    const intersects = this._raycaster.intersectObjects(this._scene.children, true);

    return intersects;
  };

  private getPointedTattooIdFromIntersects = (intersects: THREE.Intersection[]) => {
    return intersects.find((intersect) => this._tattooInfoMap.get(intersect.object.uuid))?.object?.uuid;
  };

  /**
   * public方法
   **/

  // 新增addTattoo
  addTattoo = (canvas: HTMLCanvasElement) => {
    const id = canvas.id;

    const position = new THREE.Vector3();

    const orientation = new THREE.Euler();

    const [x, y] = computeTattooDefaultSize(canvas);

    // TODO 没能正确的理解size的z，目前已知z不涉及尺寸，与平面法向量点积有关
    const size = new THREE.Vector3(x, y, 200);

    const tattooMesh = new THREE.Mesh(
      new DecalGeometry(this._walkerMesh, position, orientation, size),
      new THREE.MeshPhongMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
        opacity: 0.98,
        depthTest: false,
      })
    );

    tattooMesh.uuid = id;

    tattooMesh.visible = false;

    const tattooOutlineMesh = new THREE.Mesh(
      new DecalGeometry(this._walkerMesh, position, orientation, new THREE.Vector3().copy(size)),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.3,
        depthTest: false,
      })
    );

    this._scene.add(tattooOutlineMesh, tattooMesh);

    this._tattooInfoMap.set(canvas.id, {
      id,
      canvas,
      mesh: tattooMesh,
      outlineMesh: tattooOutlineMesh,
      size,
      orientation,
      position,
    });

    this.markTattooAsActive(id);
  };

  markTattooAsActive = (id: string) => {
    this.activeTattooId = id;

    const activeTattoo = this._tattooInfoMap.get(id)!;

    const outlineMesh = activeTattoo.outlineMesh;
    outlineMesh.material.color.setHex(0x6495ed);
  };

  clearActiveTattoo = () => {
    if (this.activeTattooId) {
      const activeTattoo = this._tattooInfoMap.get(this.activeTattooId)!;
      activeTattoo.outlineMesh.visible = false;
      this.activeTattooId = null;
    }
  };

  rotate = (id: string, value: number) => {
    const tattoo = this._tattooInfoMap.get(id);

    if (!tattoo) {
      return null;
    }

    const orientation = new THREE.Euler().copy(tattoo.orientation);
    orientation.z = value;

    this.updateTattooMesh(tattoo, { orientation });
  };

  scale = (id: string, value: number) => {
    const tattoo = this._tattooInfoMap.get(id);

    if (!tattoo) {
      return null;
    }

    const [x, y] = computeTattooDefaultSize(tattoo.canvas);

    const size = new THREE.Vector3(x * value, y * value, 200);

    this.updateTattooMesh(tattoo, { size });
  };

  resize = () => {
    this._camera.aspect = this._container.offsetWidth / this._container.offsetHeight;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(this._container.offsetWidth, this._container.offsetHeight);
  };

  setSkin = (hex: number) => {
    this._walkerMesh.material.color.setHex(hex);
  };

  lookAt = (y: number) => {
    this._controls.target.setY(y);
    this._controls.update();
  };
}
