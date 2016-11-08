mapInit: function () {
            var self = this;

            this.map = new ymaps.Map(this.mapId,
                {
                    center: [63.33695, 106.615858],
                    zoom: 4,
                    controls: ['typeSelector'],
                    behaviors: ['drag', 'scrollZoom', 'dblClickZoom', 'multiTouch']
                }, {
                    minZoom: 4,
                    maxZoom: 7,
                    maxAnimationZoomDifference: 10
                }
            );

            var color ='islands#blueCircleDotIconWithCaption',                
                hover_color = 'islands#redCircleDotIconWithCaption';

            this.objectManager = new ymaps.ObjectManager(omOptions);

            this.map.geoObjects.add(this.objectManager);

            this.objectManager.objects.events.add('click', function (e) {
                var id = e.get('objectId'),
                    projects = self.objectManager.objects.getById(id).properties['projects'];

                // revert color for previous selected point
                if (self.selected) {
                    self.objectManager.objects.setObjectOptions(self.selected, {
                        preset: color
                    });
                }

                self.selected = id;

                // send click event
                Dispatcher.dispatch({
                    actionType: constants.POINT_CLICK,
                    data: {projects: projects, id: id}
                });

            }).add(['mouseenter', 'mouseleave'], function (e) {

                var id = e.get('objectId');

                if (e.get('type') == 'mouseenter') {
                    self.objectManager.objects.setObjectOptions(id, {
                        preset: hover_color
                    });
                } else {
                    if (id != self.selected) {
                        self.objectManager.objects.setObjectOptions(id, {
                            preset: color
                        });
                    }
                }
            });
        },