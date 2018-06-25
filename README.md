react fireworks

在react框架中使用的烟花效果

使用方式：

1.安装

npm i react-fireworks

2.引用

import fireworks from 'react-fireworks';

3.使用

fireworks.init("your dom id",{});

4.api

● fireworks.start()

● fireworks.stop()

参数配置：

1、width 宽度 单位px 

2、height 高度 单位px 

3、top，bottom，left，right 绝对布局参数 

4、frequency 烟花发射频率 单位：毫秒 

5、launch_speed 烟花发射速度 （推荐值：5-10）

6、launch_particles_size 烟花发射粒子大小（推荐值：0-10） 

7、explode_particles_resistance 爆炸粒子半径 （推荐值：4-10） 

8、explode_debris_num 爆炸粒子个数 

9、explode_particles_size 爆炸粒子大小


