import Taro, {useState, useEffect} from '@tarojs/taro'
import { useSelector, useDispatch } from '@tarojs/redux'
import { View, Text, ScrollView, Button} from '@tarojs/components'
import { judgeMoveDeg, judgeMoveDerection } from '../../utils/judgeMoveAction'
import { getDaysDis, formatToday, transDate } from '../../utils/timeFormat'
import { moveDerection, commemoration } from '../../typings/types'
import AddPic from '../../components/addPic'
import { InitConfig } from '../../typings/types'
import { createSetMainFormatAction } from '../../store/actions/mainformat-actions'
import { createSetBgsAction } from '../../store/actions/bgs-actions'
import './index.styl'

export default function Index() {
  const dispatch = useDispatch();
  const today = formatToday('YYYY-MM-DD');
  const com: commemoration[] = [];
  const [isFormat, setIsFormat] = useState(false);
  const events = useSelector(state => (state as InitConfig).eventArr)
  const daysType = useSelector(state => [{name: '全部'}, ...(state as InitConfig).daysType])
  const backgrounds = useSelector( state => (state as InitConfig).defaultBg)
  const mainFormat = useSelector( state => (state as InitConfig).mainFormat)
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [chooseType, setChooseType] = useState(0);
  const [topList, setTopList] = useState(com);
  const [normalList, setNormalList] = useState(com);

  useEffect(() => {
    setTopNormal();
  }, [events])

  const slideToRight = () => {
    setIsFormat(true)
  }

  const slideToLeft = () => {
    setIsFormat(false)
  }

  const getTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  }

  const judgeMoveAction = (e) => {
    const moveDisX = e.touches[0].clientX - startX;
    const moveDisY = e.touches[0].clientY - startY;
    // judge move degree
    const ifEffectiveMove = judgeMoveDeg(moveDisX, moveDisY);
    // judge move derection
    if (ifEffectiveMove) {
      const derection = judgeMoveDerection(moveDisX);
      switch (derection) {
        case moveDerection.left: 
          slideToLeft();
          break;
        case moveDerection.right:
          slideToRight();
          break;
      }
    }
  }

  const changeFormat = async (index) => {
    dispatch(createSetMainFormatAction(backgrounds[index]))
  }

  const addNewBg = async () => {
    const res = await Taro.chooseImage({
      count: 1,
      sourceType: ['album']
    });
    const tempPicPath = res.tempFilePaths[0];
    const newBgs = [...backgrounds, tempPicPath];
    dispatch(createSetBgsAction(newBgs))
  }

  const setTopNormal = () => {
    const top: commemoration[] = [];
    const normal: commemoration[] = [];
    events.forEach(ele => {
      if (ele.isTop) {
        top.push(ele)
      }
        normal.push(ele)
    });
    setTopList(top);
    setNormalList(normal);
  }

  const changeType = async (e, index) => {
    e.stopPropagation();
    setChooseType(index);
    const top: commemoration[] = [];
    const normal: commemoration[] = [];
    events.forEach(ele => {
      if(index === 0) {
        ele.isTop && top.push(ele);
        normal.push(ele);
      } else {
          if (ele.isTop) {
            top.push(ele)
          }
          if(ele.type === daysType[index].name) {
            normal.push(ele)
          }
        }
    });
    setTopList(top);
    setNormalList(normal);
  }

  // addEvent
  const addEvent = () => {
    Taro.navigateTo({
      url: '../addDay/addDay'
    })
  }

  // to larger view
  const toLargerView = (ele) => {
    Taro.navigateTo({
      url: `../largerView/largerView?id=${ele.id}`
    })
  }
  const typeItems = daysType.map((ele, index) => {
    return (
      <View className="type-item-wrapper" key={ele.name}>
        <View className="type-item" onClick={(e) => {changeType(e, index)}}>
          <View className="type-icon at-icon at-icon-sketch" />
          <Text>{ ele.name }</Text>
          {daysType[chooseType].name === ele.name ? <View className="type-icon checked at-icon at-icon-check-circle" /> : null}
        </View>
      </View>
    )
  })

  const topItemList = topList.map((ele) => {
    const daysDis = getDaysDis(ele.aimDate, today);
      return (
        <View className="event-item" onClick={()=> {toLargerView(ele)}} key={ele.id}>
          <View className="title">{ele.title}{daysDis > 0 ? '还有' : '已经'}</View>
          <View className="daysNum">
            <Text className="dis">{daysDis < 0 ? - daysDis : daysDis}</Text>
            <Text className="icon">Days</Text>
          </View>
          <View className="date">
            {transDate(ele.aimDate, 'YYYY.M.D', true)}
          </View>
        </View>
      )
  })

  const normalItemList = normalList.map((ele) => {
    const daysDis = getDaysDis(ele.aimDate, today);
    return (
      <View key={ele.id} className="event-item" onClick={()=> {toLargerView(ele)}}>
        <View className="top-row row">
          <View className="title">{ele.title}{daysDis > 0 ? '还有' : '已经'}</View>
          <View className="dis">{daysDis < 0 ? - daysDis : daysDis}</View>
        </View>
        <View className="down-row row">
          <View className="date">{transDate(ele.aimDate, 'YYYY.M.D', true)}</View>
          <View>Days</View>
        </View>
      </View>
    )
  })

    return (
      <View className="days-matter">
        <View className={`inner-moveable ${isFormat === true ? 'slide-right' : ''}`} onTouchMove={e => {judgeMoveAction(e)}} onTouchStart={e => {getTouchStart(e)}}>
          <View className="format-set" style={{backgroundImage: `url(${mainFormat})`, backgroundSize: 'cover'}}>
            <View className="format-set-wrapper">
            <View className="header-wrapper">
              <View className="close-wrapper">
                <View className="close at-icon at-icon-close-circle" onClick={slideToLeft}/>
              </View>
            </View>
              <View className="type-list">
                { typeItems }
              </View>
              <View className="format-area">
                <View className="title">
                  <View className="title-icon at-icon at-icon-camera" />
                  <Text>版式</Text>
                </View>
                <AddPic size="little" handleClick={changeFormat} activeBg={mainFormat} onAdd={addNewBg} backgrounds={backgrounds}/>
              </View>
              <Button className="add" onClick={addEvent}>+  添加事件</Button>
            </View>
          </View>
          <View className="main-content" style={{backgroundImage:`url(${mainFormat})`, backgroundSize: 'cover'}}>
            {/* <View className="header">
              <View className="logo">倒数日</View>
              <View className="add" onClick={addEvent}>+添加</View>
            </View> */}
            <View className="body">
              <ScrollView className="items" scrollY={true}>
                <View className="top-list">
                  { topItemList }
                </View>
                <View className="normal">
                  { normalItemList }
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    )
}