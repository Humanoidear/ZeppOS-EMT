import { createWidget, widget, align, text_style, redraw, deleteWidget, event, prop } from "@zos/ui";
import { log as Logger, px } from "@zos/utils";
import { Geolocation } from "@zos/sensor";
import { push } from '@zos/router';
import { updateStatusBarTitle } from '@zos/ui';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from "../utils/config/device";

const geolocation = new Geolocation();

const logger = Logger.getLogger("fetch_api");
const { messageBuilder } = getApp()._options.globalData;
const PILL_HEIGHT = 190;
const REFRESH = 30000;

Page({
  state: {},
  onInit() {
    updateStatusBarTitle("EMT | Closest Stops");
  },
  build() {
    // Call getStops on page load
    loading = createWidget(widget.TEXT, {
      x: px(0),
      y: px(0),
      w: DEVICE_WIDTH,
      h: DEVICE_HEIGHT,
      text: "Loading...",
      text_size: px(36),
      color: 0xcccccc,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
    });

    setInterval(() => {
      redraw();
      this.getStops();
    }, REFRESH);
  },

  getStops() {
    geolocation.start();
    const latitude = geolocation.getLatitude();
    const longitude = geolocation.getLongitude() * -1;

    messageBuilder
      .request({
        method: "GET_EMT",
        params: {
          latitude,
          longitude,
        },
      })
      .then((data) => {


        const viewContainer = createWidget(widget.VIEW_CONTAINER, {
          x: px(0),
          y: px(100),
          w: DEVICE_WIDTH,
          h: DEVICE_HEIGHT - px(100),
        });

        let totalIndex = 0;

        if (data.result === "No Content") {
          viewContainer.createWidget(widget.FILL_RECT, {
            x: px(0),
            y: px(20),
            w: DEVICE_WIDTH,
            h: px(300),
            radius: px(30),
            color: 0x1a1a1a,
          });
          viewContainer.createWidget(widget.TEXT, {
            x: px(0),
            y: px(60),
            w: DEVICE_WIDTH,
            h: px(200),
            text: "!",
            text_size: px(80),
            color: 0xcccccc,
            align_h: align.CENTER_H,
          });
          viewContainer.createWidget(widget.TEXT, {
            x: px(0),
            y: px(200),
            w: DEVICE_WIDTH,
            h: px(70),
            text: "No stops found nearby",
            text_size: px(36),
            color: 0xcccccc,
            align_h: align.CENTER_H,
          });
          totalIndex += 1.7;
          deleteWidget(loading);
        }

        if (data.result === "ERROR") {
          viewContainer.createWidget(widget.FILL_RECT, {
            x: px(0),
            y: px(20),
            w: DEVICE_WIDTH,
            h: px(300),
            radius: px(30),
            color: 0x1a1a1a,
          });
          viewContainer.createWidget(widget.TEXT, {
            x: px(0),
            y: px(60),
            w: DEVICE_WIDTH,
            h: px(200),
            text: "!",
            text_size: px(80),
            color: 0xcccccc,
            align_h: align.CENTER_H,
          });
          viewContainer.createWidget(widget.TEXT, {
            x: px(0),
            y: px(200),
            w: DEVICE_WIDTH,
            h: px(70),
            text: "Phone disconnected",
            text_size: px(36),
            color: 0xcccccc,
            align_h: align.CENTER_H,
          });
          totalIndex += 1.7;
          deleteWidget(loading);
        }

        const MESSAGE_HEIGHT = 0;

        viewContainer.createWidget(widget.TEXT, {
          x: px(30),
          y: px(0),
          w: DEVICE_WIDTH - px(60),
          h: px(MESSAGE_HEIGHT),
          text_size: px(36),
          color: 0xcccccc,
          align_h: align.LEFT,
          align_v: align.TOP,
          text: "Closest stops",
        });

        Array.from({ length: data.length }).forEach((_, index) => {
          const stop = data.result[index];

          const pill = viewContainer.createWidget(widget.FILL_RECT, {
            x: 0,
            y: px(index * (PILL_HEIGHT + 10) + MESSAGE_HEIGHT),
            w: DEVICE_WIDTH,
            h: px(PILL_HEIGHT),
            color: 0x181818,
            radius: px(30)
          });

          if (stop.closestBus) {
            const time = viewContainer.createWidget(widget.TEXT, {
              x: px(30),
              y: px(20) + px(index * (PILL_HEIGHT + 10) + MESSAGE_HEIGHT),
              w: DEVICE_WIDTH - px(100),
              h: px(46),
              text_size: px(28),
              color: (stop.closestBus.minutos && (parseInt(stop.closestBus.minutos) <= 5 || stop.closestBus.minutos.toLowerCase() === 'next')) ? 0x66ff66 : 0xcccccc, // Green if minutes <= 5 or text is "Now", otherwise light gray
              align_h: align.RIGHT,
              align_v: align.TOP,
              text: stop.closestBus.minutos || stop.closestBus.horaLlegada || 'N/A', // Use minutos, if not present use horaLlegada, otherwise 'N/A'
            });

            const timebg = viewContainer.createWidget(widget.FILL_RECT, {
              x: DEVICE_WIDTH - px(60),
              y: px(30) + px(index * (PILL_HEIGHT + 10) + MESSAGE_HEIGHT),
              w: px(30),
              h: px(30),
              color: 0xff0000,
              radius: px(30),
            });

            const timenum = viewContainer.createWidget(widget.TEXT, {
              x: DEVICE_WIDTH - px(60),
              y: px(32) + px(index * (PILL_HEIGHT + 10) + MESSAGE_HEIGHT),
              w: px(30),
              h: px(30),
              text_size: px(18),
              color: 0xffffff,
              align_h: align.CENTER_H,
              align_v: align.TOP,
              text: stop.closestBus.linea,
            });

            time.addEventListener(event.CLICK_UP, () => {
              pill.setProperty(prop.DATASET, {
                color: 0x1a1a1a,
              })
              push({
                url: '/pages/stop',
                params: {
                  stopId: stop.stopId,
                  stopLatitude: stop.lat,
                  stopLongitude: stop.lon,
                  stopName: stop.name,
                  stopUbica: stop.ubica,
                  stopRoutes: stop.routes,
                }
              });
            });
            timebg.addEventListener(event.CLICK_UP, () => {
              pill.setProperty(prop.DATASET, {
                color: 0x1a1a1a,
              })
              push({
                url: '/pages/stop',
                params: {
                  stopId: stop.stopId,
                  stopLatitude: stop.lat,
                  stopLongitude: stop.lon,
                  stopName: stop.name,
                  stopUbica: stop.ubica,
                  stopRoutes: stop.routes,
                }
              });
            });
            timenum.addEventListener(event.CLICK_UP, () => {
              pill.setProperty(prop.DATASET, {
                color: 0x1a1a1a,
              })
              push({
                url: '/pages/stop',
                params: {
                  stopId: stop.stopId,
                  stopLatitude: stop.lat,
                  stopLongitude: stop.lon,
                  stopName: stop.name,
                  stopUbica: stop.ubica,
                  stopRoutes: stop.routes,
                }
              });
            });
          } else {
            const time = viewContainer.createWidget(widget.TEXT, {
              x: px(30),
              y: px(20) + px(index * (PILL_HEIGHT + 10) + MESSAGE_HEIGHT),
              w: DEVICE_WIDTH - px(60),
              h: px(46),
              text_size: px(28),
              color: 0xcccccc, // Light gray color
              align_h: align.RIGHT,
              align_v: align.TOP,
              text: "No service",
            });

            time.addEventListener(event.CLICK_UP, () => {
              pill.setProperty(prop.DATASET, {
                color: 0x1a1a1a,
              })
              push({
                url: '/pages/stop',
                params: {
                  stopId: stop.stopId,
                  stopLatitude: stop.lat,
                  stopLongitude: stop.lon,
                  stopName: stop.name,
                  stopUbica: stop.ubica,
                  stopRoutes: stop.routes,
                }
              });
            });
          }

          Array.from({
            length: Array.isArray(stop.routes.rtI) ? stop.routes.rtI.length : 1,
          }).forEach((_, index2) => {
            const route = Array.isArray(stop.routes.rtI)
              ? stop.routes.rtI[index2]
              : stop.routes.rtI;
            console.log(index, index2, route.id_linea);
            const lineimg = viewContainer.createWidget(widget.IMG, {
              x: px(30) + px(index2 * 50),
              y: px(20) + px(index * (PILL_HEIGHT + 10) + MESSAGE_HEIGHT),
              src: `/line_images/${route.id_linea}.png`,
            });

            lineimg.addEventListener(event.CLICK_UP, () => {
              pill.setProperty(prop.DATASET, {
                color: 0x1a1a1a,
              })
              push({
                url: '/pages/stop',
                params: {
                  stopId: stop.stopId,
                  stopLatitude: stop.lat,
                  stopLongitude: stop.lon,
                  stopName: stop.name,
                  stopUbica: stop.ubica,
                  stopRoutes: stop.routes,
                }
              });
            });
          });

          const name = viewContainer.createWidget(widget.TEXT, {
            x: px(30),
            y: px(70) + px(index * (PILL_HEIGHT + 10) + MESSAGE_HEIGHT),
            w: DEVICE_WIDTH - px(60),
            h: px(46),
            text_size: px(36),
            color: 0xffffff,
            align_h: align.LEFT,
            align_v: align.TOP,
            text: `${stop.stopId} - ${stop.name}`,
          });

          const address = viewContainer.createWidget(widget.TEXT, {
            x: px(30),
            y: px(120) + px(index * (PILL_HEIGHT + 10) + MESSAGE_HEIGHT),
            w: DEVICE_WIDTH - px(60),
            h: px(46),
            text_size: px(28),
            color: 0xcccccc,
            align_h: align.LEFT,
            align_v: align.BOTTOM,
            text_style: text_style.ELLIPSIS,
            text: `${stop.ubica}`,
          });

          pill.addEventListener(event.CLICK_UP, () => {
            pill.setProperty(prop.DATASET, {
              color: 0x1a1a1a,
            })
            push({
              url: '/pages/stop',
              params: {
                stopId: stop.stopId,
                stopLatitude: stop.lat,
                stopLongitude: stop.lon,
                stopName: stop.name,
                stopUbica: stop.ubica,
                stopRoutes: stop.routes,
              }
            });
          });
          name.addEventListener(event.CLICK_UP, () => {
            pill.setProperty(prop.DATASET, {
              color: 0x1a1a1a,
            })
            push({
              url: '/pages/stop',
              params: {
                stopId: stop.stopId,
                stopLatitude: stop.lat,
                stopLongitude: stop.lon,
                stopName: stop.name,
                stopUbica: stop.ubica,
                stopRoutes: stop.routes,
              }
            });
          });
          address.addEventListener(event.CLICK_UP, () => {
            pill.setProperty(prop.DATASET, {
              color: 0x1a1a1a,
            })
            push({
              url: '/pages/stop',
              params: {
                stopId: stop.stopId,
                stopLatitude: stop.lat,
                stopLongitude: stop.lon,
                stopName: stop.name,
                stopUbica: stop.ubica,
                stopRoutes: stop.routes,
              }
            });
          });
          totalIndex += 1;
        });

        viewContainer.createWidget(widget.BUTTON, {
          x: px(0),
          y: px(20) + px(totalIndex * (PILL_HEIGHT + 10) + MESSAGE_HEIGHT),
          w: DEVICE_WIDTH,
          h: px(60),
          text: "Refresh",
          normal_color: 0x000000,
          press_color: 0x1a1a1a,
          radius: px(10),
          text_size: px(36),
          color: 0x262626,
          click_func: () => {
            loading = createWidget(widget.TEXT, {
              x: px(0),
              y: px(0),
              w: DEVICE_WIDTH,
              h: DEVICE_HEIGHT,
              text: "Loading...",
              text_size: px(36),
              color: 0xcccccc,
              align_h: align.CENTER_H,
              align_v: align.CENTER_V,
            });
            deleteWidget(viewContainer);
            this.getStops();
          },
        });
        deleteWidget(loading);

        setTimeout(() => {
          deleteWidget(viewContainer);
        }, REFRESH);
      })
      .catch((error) => {
        logger.error("Error receiving transport data", error);
      });
  },
});
