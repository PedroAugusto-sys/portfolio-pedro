import Scene3D from './Scene3D'
import LuminousBackground3D from './LuminousBackground3D'

const GlobalBackground3D = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Scene3D enableControls={false} className="w-full h-full">
        <LuminousBackground3D />
      </Scene3D>
    </div>
  )
}

export default GlobalBackground3D
