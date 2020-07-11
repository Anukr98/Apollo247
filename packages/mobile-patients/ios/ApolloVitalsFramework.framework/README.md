# dots-animation
Code snippet in swift 3 for three dots animating to show progress or waiting or whatever

## Usage

#### Start Animation
```javascript
let viewToAnimate = UIView(frame: CGRect(x: 0, y: 0, width: 24, height: 24))
viewToAnimate.backgroundColor = UIColor(white: 1, alpha: 0)
let animation = DotsAnimation()
animationDots = animation.startDotsAnimation(superView: viewToAnimate, dotsColor: UIColor.white)
viewToAnimate.addSubview(animationDots)
```
#### Stop Animation
```javascript
let animation = DotsAnimation()
animation.stopDotsAnimation(dots: animationDots)
```

###### PS: I'm ~~a noob~~ an amateur in swift. Planning on making this more versatile and dynamic. Suggestions and improvements are always welcome.
