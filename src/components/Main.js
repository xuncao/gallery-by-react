require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

// 获取图片相关的数据
let imageDatas = require('../data/imageDatas.json')

// 利用自执行函数，将图片信息转换成图片url路径信息
imageDatas = (function getImageURL(imageDatasArr) {
  for (let i = 0; i < imageDatasArr.length; i++) {
    let singleImageData = imageDatasArr[i];
    singleImageData.imageURL = require('../images/' + singleImageData.fileName);
    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

class ImgFigure extends React.Component {
  render() {
    let styleObj = {};
    // 如果props属性中指定了这张图片的位置，则使用
    if (this.props.arrange.pos) {
      styleObj = this.props.arrange.pos;
    }
    // 如果图片的旋转角度有值且不为0，添加旋转角度
    // if (this.props.arrange.rotate) {
    //   (['MozTransform', 'msTransform', 'WebkitTransform', 'transform']).forEach((value) => {
    //     styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
    //   });
    // }

    // if (this.props.arrange.isCenter) {
    //   styleObj.zIndex = 11;
    // }

    let imgFigureClassName = "img-figure";
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

    return (
      <figure className="img-figure" style={styleObj}>
        <img src={this.props.data.imageURL} alt={this.props.data.title}/>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
        </figcaption>
      </figure>
    );
  }
}

class GalleryByReactApp extends React.Component {
  constructor (props) {
    super(props);
    this.Constant = {
      centerPos: {
        left: 0,
        top: 0
      },
      hPosRange: { // 水平方向取值范围
        leftSecX: [0, 0],
        rightSecX: [0, 0],
        y: [0, 0]
      },
      vPosRange: { // 垂直方向取值范围
        x: [0, 0],
        topY: [0, 0]
      }
    }

    this.state = {
      imgsArrangeArr: [{}]
    }
  }

  /* es6写法，初始化state 在构造函数中
  getInitialState () {
    return {
      imgsArrangeArr: [
        {
          pos: {
            left: '0',
            top: '0'
          }
        }
      ]
    }
  }*/

  /*
   * 获取区间内的一个随机值
   * @param low 
   * @param high 
   */
  getRangeRandom(low, high) {
    return Math.ceil(Math.random() * (high - low) + low);
  }

  /*
   * 获取-30 ~ 30任意值
   */
  get30Random() {
    return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
  }

  /*
   * 重新布局所有图片
   * @param centerIndex 指定居中排布那个图片
   */
  reArrange (centerIndex) {
    let imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        imgsArrangeTopArr = [],
        topImgNum = Math.floor(Math.random() * 2), // 取一个或者不取
        topImgSpliceIndex = 0,

        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

    // 首先居中 centerIndex 的图片
    imgsArrangeCenterArr[0].pos = centerPos;

    // 取出要布局上侧图片的状态信息
    topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum))
    imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum)

    // 布局位于上侧的图片
    imgsArrangeTopArr.forEach((value, index) => {
      value = {
        pos: {
          top: this.getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
          left: this.getRangeRandom(vPosRangeX[0], vPosRangeX[1])
        },
        rotate: this.get30Random(),
        isInverse: false,
        isCenter: false
      }
    })

    // 布局左右两侧的图片
    for (var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
      var hPosRangeLORX = null;

      // 前半部分布局左边，后半部分布局右边
      if (i < k) {
        hPosRangeLORX = hPosRangeLeftSecX;
      } else {
        hPosRangeLORX = hPosRangeRightSecX;
      }
      imgsArrangeArr[i] = {
        pos: {
          top: this.getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
          left: this.getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
        },
        rotate: this.get30Random(),
        isInverse: false,
        isCenter: false
      };
    }

    // 将上侧图片信息放回数组
    if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
      imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeArr[0]);
    }

    // 将中心区域图片信息放回数组
    imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

    this.setState({
      imgsArrangeArr: imgsArrangeArr
    })
  }

  // 组件加载以后，为每张图片计算其位置的范围
  componentDidMount () {
    // 首先拿到舞台的大小
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    // 拿到一个imgFigure的大小
    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

    // 计算中心图片的位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    }

    // 计算左侧、右侧区域图片排布位置的取值范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW
    this.Constant.hPosRange.y[0] = -halfImgH
    this.Constant.hPosRange.y[1] = stageH - halfImgH

    // 计算上侧区域图片排布位置的取值范围
    this.Constant.vPosRange.topY[0] = -halfImgH
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3
    this.Constant.vPosRange.x[0] = halfStageW - imgW
    this.Constant.vPosRange.x[1] = halfStageW

    this.reArrange(0)
  }

  render() {
    var controllerUnits = [],
        imgFigures = [];

    imageDatas.forEach(function (value, index) {
      if (!this.state.imgsArrangeArr[index]) {
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          }
        }
      }
      imgFigures.push(<ImgFigure data={value} key={'imgFigure' + index} ref={'imgFigure' + index} arrange={this.state.imgsArrangeArr[index]}/>);
    }.bind(this))

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

GalleryByReactApp.defaultProps = {
};

export default GalleryByReactApp;
