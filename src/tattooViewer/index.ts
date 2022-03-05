import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import { throttle } from "lodash";
import Stats from "stats.js";

// import walkerFbxUrl from "./BodyMesh.fbx?url";
import walkerFbxUrl from "./walker.fbx?url";

interface IConfig {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
}

interface ITattooInfo {
  id: string | number;
  canvas: HTMLCanvasElement;
  mesh: THREE.Mesh<DecalGeometry, THREE.MeshPhongMaterial>;
  size: THREE.Vector3;
}

export default class TattooViewer {
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

  private _mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshNormalMaterial());

  private _raycaster = new THREE.Raycaster();

  private _eventLock = false;

  constructor({ container, canvas }: IConfig) {
    this._canvas = canvas;
    this._container = container;
    this.init().then(() => {
      // eslint-disable-next-line no-console
      console.log("初始化完成");

      this.bindEvent();
    });
  }

  // 初始化
  private init = async () => {
    // 场景
    this._scene.background = new THREE.Color(0xa0a0a0);
    // this._scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
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
    // this._mouseHelper.visible = false;
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

    // 计算法线
    this._walkerMesh.geometry.computeVertexNormals();

    // 渲染器
    this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas, antialias: true });
    this._renderer.shadowMap.enabled = true;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._renderer.shadowMap.enabled = true;
    this._container.appendChild(this._renderer.domElement);

    // 控制器
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enablePan = false;
    // this._controls.enableZoom = false;
    // this._controls.target.set(0, 1000, 0);
    this._controls.target.set(0, 1000, 0);
    this._controls.update();

    this._controls.addEventListener("change", (e) => {
      this._eventLock = true;
    });

    // stats
    this._container.appendChild(this._state.dom);

    // 开启动画
    this.animate();
  };

  // 捆绑拾取

  private bindEvent = () => {
    window.addEventListener("pointerdown", (e) => {
      this._eventLock = false;
    });

    // window.addEventListener("pointerup", (e) => {
    //   if (this._eventLock) {
    //     return;
    //   }
    //   const intersects = this.getIntersectsByMouseEvent(e);
    //
    //   const clickedTattooMesh = intersects.find((intersect) => {
    //     return this._tattooInfoMap.get(intersect.object.uuid);
    //   });
    //
    //   const clickedWalkerMesh = intersects.find((intersect) => {
    //     return (intersect.object.uuid = this._walkerMesh.uuid);
    //   });
    //
    //   if (!clickedWalkerMesh) {
    //     return;
    //   }
    //
    //   // 如果有active的纹身
    //   if (this._activeTattooId) {
    //     const activeTattooInfo = this._tattooInfoMap.get(this._activeTattooId!)!;
    //
    //     if (activeTattooInfo.mesh) {
    //       // 如果active的纹身,有mesh，则取消纹身选中状态
    //     } else {
    //       // 如果active的纹身,没有mesh，则添加mesh
    //       // if (clickedWalkerMesh) {
    //       //   const object = intersects[0];
    //       //
    //       //   const activeTattooInfo = this._tattooInfoMap.get(this._activeTattooId!)!;
    //       //
    //       //   if (activeTattooInfo && !activeTattooInfo.mesh) {
    //       //     this._mouseHelper.position.copy(object.point);
    //       //
    //       //     const n = object.face!.normal.clone();
    //       //     n.transformDirection(this._walkerMesh.matrixWorld);
    //       //     n.multiplyScalar(100);
    //       //     n.add(object.point);
    //       //
    //       //     this._mouseHelper.lookAt(n);
    //       //
    //       //     // const position = new THREE.Vector3().copy(object.point);
    //       //     //
    //       //     // const orientation = new THREE.Euler().copy(this._mouseHelper.rotation);
    //       //     //
    //       //     // // TODO 没能正确的理解size的z，目前已知z不涉及尺寸，与平面法向量点积有关
    //       //     // const size = new THREE.Vector3(324, 405, 200);
    //       //     //
    //       //     // const decalGeometry = new DecalGeometry(this._walkerMesh, position, orientation, size);
    //       //     //
    //       //     // const texture = new THREE.CanvasTexture(activeTattooInfo.canvas);
    //       //     //
    //       //     // const material = new THREE.MeshPhongMaterial({
    //       //     //   map: texture,
    //       //     //   transparent: true,
    //       //     //   opacity: 0.8,
    //       //     // });
    //       //     //
    //       //     // const tattooMesh = new THREE.Mesh(decalGeometry, material);
    //       //     //
    //       //     // this._scene.add(tattooMesh);
    //       //
    //       //     // activeTattooInfo.mesh = tattooMesh;
    //       //   }
    //       // }
    //     }
    //     return undefined;
    //   }
    // });

    window.addEventListener("pointermove", this.onPointerMove);
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    this._renderer.render(this._scene, this._camera);

    this._state.update();
  };

  private onPointerMove = throttle((e: PointerEvent) => {
    if (this._eventLock) {
      return;
    }

    if (!this._activeTattooId) {
      return;
    }

    const intersects = this.getIntersectsByMouseEvent(e);

    const movedWalkerMesh = intersects.find((intersect) => (intersect.object.uuid = this._walkerMesh.uuid));

    if (!movedWalkerMesh) {
      return;
    }

    this._mouseHelper.position.copy(movedWalkerMesh.point);

    const n = movedWalkerMesh.face!.normal.clone();
    n.transformDirection(this._walkerMesh.matrixWorld);
    n.multiplyScalar(10);
    n.add(movedWalkerMesh.point);

    this._mouseHelper.lookAt(n);

    // 移动纹身贴图
    const activeTattoo = this._tattooInfoMap.get(this._activeTattooId)!;

    const tattooMesh = activeTattoo.mesh;

    tattooMesh.visible = true;

    const position = new THREE.Vector3().copy(movedWalkerMesh.point);
    //
    const orientation = new THREE.Euler().copy(this._mouseHelper.rotation);

    const size = new THREE.Vector3().copy(activeTattoo.size);

    const newDecalGeometry = new DecalGeometry(this._walkerMesh, position, orientation, size);

    tattooMesh.geometry = newDecalGeometry;

    return null;
  }, 100);

  private getIntersectsByMouseEvent = (e: MouseEvent) => {
    const pointer = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    };

    this._raycaster.setFromCamera(pointer, this._camera);

    const intersects = this._raycaster.intersectObjects(this._scene.children);

    return intersects;
  };

  /**
   * public方法
   **/

  // 新增addTattoo
  addTattoo(canvas: HTMLCanvasElement) {
    const id = canvas.id;

    const position = new THREE.Vector3();

    const orientation = new THREE.Euler();

    // TODO 没能正确的理解size的z，目前已知z不涉及尺寸，与平面法向量点积有关
    const size = new THREE.Vector3(324, 405, 200);

    const decalGeometry = new DecalGeometry(this._walkerMesh, position, orientation, size);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
    });

    const tattooMesh = new THREE.Mesh(decalGeometry, material);

    console.log(decalGeometry);

    tattooMesh.visible = false;

    this._scene.add(tattooMesh);

    this._tattooInfoMap.set(canvas.id, {
      id,
      canvas,
      mesh: tattooMesh,
      size,
    });

    this._activeTattooId = id;
  }
}
