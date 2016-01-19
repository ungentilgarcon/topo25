Template.filterByWeight.helpers({
    hasEdgesWeight: function() {
        var edge = Edges.findOne();
        if (!edge) return false
        else return edge.data.count ? true : false;
    }

})

Template.filterByWeight.rendered = function() {
    var edge = Edges.findOne();

    if ( edge && edge.data.count ) {
        var self = this;

        // TODO calculate
        this.min = 0;
        this.max = 256;

        // create slider
        noUiSlider.create($("#filterEdgeByWeight")[0], {
            start: [20, 100],
            connect: true,
            range: {
                'min': self.min,
                'max': self.max
            },
            format: wNumb({
                decimals: 0
            })
        })


        //events
        $("#filterEdgeByWeight")[0].noUiSlider
            .on('slide', function(val) {
                Session.set('filterEdgeByWeight', val);
            })

        $("#filterEdgeByWeight")[0].noUiSlider
            .on('change', function(val) {
                Session.set('filterEdgeByWeight', [Math.round(val[0]), Math.round(val[1])]);

                var net = self.view.parentView.parentView.parentView._templateInstance.network.get().net;
                // console.log(self.min, self.max);
                var colorScale = d3.scale.category10().domain([val[0], val[1]]);

                net.edges().css({
                    "line-color": function(e) {
                        console.log(e.data().count);
                        if (e.data().count < val[0] ||  e.data().count > val[1]) return "#555"
                        else return colorScale(e.data().count)
                    }
                });

            });
    }
};
