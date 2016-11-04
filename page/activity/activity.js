var requests = require( '../../requests/request.js' );
var util = require( '../../utils/util.js' );
const PIC_BASE = "http://www.movetechx.com/upload/";

Page({
    data:{        
        curpage: 1,
		curpageData: {}, //当前列表数据
        pageData: {}, //列表数据
		scrollbmp: [], // 图片数据
		days: [], // 日期数据
		budget: [], // 金额数据
        loadingMore: false, //是否正在加载
    },

    onLoad:function() {
    	console.log("activity.js...onLoad")    					
    },
	onReady: function() {
		var _this = this;	
    	console.log("activity.js...onReady")

		var body = {
			"page": _this.data.curpage,
			"pageSize": "5"
		}
			
		requests.getActivityList( body, ( data ) => {
			console.log("getActivityList success..data="+data.activityPage.activities)
			_this.setData( { 
				curpageData: data.activityPage.activities,
				pageData: data.activityPage.activities 
				});
		}, null, () => {
			console.log("getActivityList complete..pageData="+_this.data.pageData)
			dynamicFillPage.call(_this);
		});
	},
		
	//列表加载更多
  	loadingMoreEvent: function( e ) {
		var _this = this;
		//console.log("loadingMoreEvent...loadingMore="+_this.data.loadingMore)
		//console.log("loadingMoreEvent...curpage="+_this.data.curpage)

		if( _this.data.loadingMore ) return;

		var local_curpage = _this.data.curpage;
		//console.log("loadingMoreEvent...local_curpage="+local_curpage)
		local_curpage++;
		//console.log("loadingMoreEvent...2.local_curpage="+local_curpage)

		//_this.setData( { loadingMore: true, curpage:_this.data.curpage++ });
		_this.setData( { loadingMore: true, curpage:local_curpage });

		console.log("loadingMoreEvent...2.curpage="+_this.data.curpage)

		var body = {
			"page": _this.data.curpage,
			"pageSize":"5"
		}

		requests.getActivityList( body, ( data ) => {
			console.log("getActivityList refresh..data="+data.activityPage.activities)
			_this.setData( { 
				curpageData: data.activityPage.activities,
				pageData: _this.data.pageData.concat( data.activityPage.activities ) 
			});
		}, null, () => {
			_this.setData( { loadingMore: false });
			dynamicFillPage.call(_this);
		});
  	},
  
    activityDetail:function(event) {
	    console.log("activityDetail..."+event)
	    
	    wx.navigateTo({ // test only, can't link external address
	        url: '../me/me'
	    })
    },
    
    
})

//填充活动列表
function dynamicFillPage() {
	var _this = this;

	var scrolllength = _this.data.curpageData.length;
	console.log("dynamicFillPage...scrolllength="+scrolllength)

	for (var i = 0; i < scrolllength; i++) {
		/**
		 * picture
		 */
		var tmppicture = this.data.curpageData[i].picture.split(",")
		console.log(i+"..dynamicFillPage...tmppicture="+tmppicture)

		/**
		 * start:2016-10-02  ; end: 2016-10-06
		 * ==> start: 10.02  ;   end: 10.06   ;  days: 10.02-10.06 5 日
		 */
		if (this.data.curpageData[i].endDate.indexOf("-") != -1) {
			var tmpenddate = this.data.curpageData[i].endDate.split("-");
			var tmpstartdate = this.data.curpageData[i].startDate.split("-");
			var intervaldate = util.GetDateDiff(tmpstartdate, tmpenddate, "-");
		} else if (this.data.curpageData[i].endDate.indexOf(".") != -1) {
			var tmpenddate = this.data.curpageData[i].endDate.split(".");
			var tmpstartdate = this.data.curpageData[i].startDate.split(".");
			var intervaldate = util.GetDateDiff(tmpstartdate, tmpenddate, ".");
		}	

		if (tmpenddate)
			var tmpdays = tmpstartdate[1] + "." + tmpstartdate[2] + "-" + tmpenddate[1] + "." + tmpenddate[2] + " " + " " + intervaldate + "日";
		else
			var tmpdays = tmpstartdate[1] + "." + tmpstartdate[2] + " 1 日";
		console.log(i+"..dynamicFillPage...tmpdays="+tmpdays)	

		/**
		 * buget
		 */
		if (this.data.curpageData[i].budget == 0) {	
			var tmpbudget = '免费';
		} else {
			var tmpbudget = this.data.curpageData[i].budget + ' 元 /人';
		}
		/**
		 * update data
		 */
		_this.setData({
			scrollbmp: this.data.scrollbmp.concat(PIC_BASE + tmppicture[0]),
			days: this.data.days.concat(tmpdays),
			budget: this.data.budget.concat(tmpbudget),
		})	
	}	
}	