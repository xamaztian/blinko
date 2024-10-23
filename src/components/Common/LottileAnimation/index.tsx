import React, { useRef } from "react";
import Lottie from "lottie-react";
import groovyWalkAnimation from "./like.json";
import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";

const LikeButton = () => {
  const [isLike, setIsLike] = React.useState(false);
  const lottieRef = useRef();
  return <div className="relative">
    <Lottie onClick={e => {
      e.preventDefault()
    }} className='absolute left-0' animationData={groovyWalkAnimation}
      loop={false}
      style={{ width: '100px', height: '100px', top: '-30px', left: '-22px', zIndex: '10', pointerEvents: 'none' }}
      // @ts-ignore
      lottieRef={lottieRef}
      autoplay={true}
      onComplete={() => {
      }}
    />
    {/* @ts-ignore */}
    <Button
      color={isLike ? 'danger' : 'default'}
      startContent={<Icon icon="icon-park-solid:like" width="24" height="24" />}
      onClick={async e => {
        {/* @ts-ignore */ }
        await lottieRef.current!.goToAndPlay(0, true)
        setIsLike(true)
      }}>喜欢</Button>
  </div>
};

export default LikeButton;