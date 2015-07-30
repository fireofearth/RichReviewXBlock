/**
 * Created by yoon on 12/21/14.
 */

var r2Ctrl = {};

/** @namespace r2 */
(function(r2){

    r2.MouseModeEnum = {
        HOVER : 0,
        RADIALMENU : 1,
        LDN : 2,
        RDN : 3
    };

    r2.mouse = (function(){
        var pub = {};

        pub.mode = r2.MouseModeEnum.HOVER;
        pub.pos_dn = new Vec2(0,0);

        pub.setDomEvents = function(){
            r2.dom.setMouseEventHandlers(
                pub.handleDn,
                pub.handleMv,
                pub.handleUp
            );
        };

        pub.getPos = function(event){
            return r2.viewCtrl.mapBrowserToScr(new Vec2(event.clientX, event.clientY))
        };

        pub.isTap = function(pt){
            var d = pub.pos_dn.subtract(pt, true);
            d = Math.sqrt(d.x * d.x + d.y * d.y) * r2.viewCtrl.page_width_noscale;
            return d < r2Const.MOUSE_CLICK_DIST_CRITERIA;
        };

        pub.handleDn = function(event){
            var new_mouse_pt = pub.getPos(event);
            if(pub.mode === r2.MouseModeEnum.HOVER){
                switch (event.which) {
                    case 1: // left click
                        pub.mode = r2.MouseModeEnum.LDN;
                        pub.pos_dn = new_mouse_pt;
                        if(r2App.mode == r2App.AppModeEnum.IDLE || r2App.mode == r2App.AppModeEnum.REPLAYING){
                            if(r2.keyboard.ctrlkey_dn)
                                r2.spotlightCtrl.recordingSpotlightDn(r2.viewCtrl.mapScrToDoc(new_mouse_pt), r2App.annot_private_spotlight);
                        }
                        else if(r2App.mode == r2App.AppModeEnum.RECORDING){
                            r2.spotlightCtrl.recordingSpotlightDn(r2.viewCtrl.mapScrToDoc(new_mouse_pt), r2App.cur_recording_annot);
                        }
                        break;
                    case 3: // rght click
                        //pub.mode = r2.MouseModeEnum.RDN;
                        //pub.pos_dn = new_mouse_pt;
                        break;
                    default:
                        break;
                }
            }
            r2App.cur_mouse_pt = new_mouse_pt;
        };

        pub.handleMv = function(event){
            var new_mouse_pt = pub.getPos(event);

            if(pub.mode == r2.MouseModeEnum.HOVER){
            }
            else if(pub.mode == r2.MouseModeEnum.LDN){
                if(r2App.mode == r2App.AppModeEnum.IDLE || r2App.mode == r2App.AppModeEnum.REPLAYING){
                    if(r2.spotlightCtrl.nowRecording()){
                        r2.spotlightCtrl.recordingSpotlightMv(r2.viewCtrl.mapScrToDoc(new_mouse_pt), r2App.annot_private_spotlight);
                    }
                    else{
                        r2.onScreenButtons.drawDnMv(pub.pos_dn, new_mouse_pt);
                    }
                }
                else if(r2App.mode == r2App.AppModeEnum.RECORDING){
                    r2.spotlightCtrl.recordingSpotlightMv(r2.viewCtrl.mapScrToDoc(new_mouse_pt), r2App.cur_recording_annot);
                }
            }
            else if(pub.mode == r2.MouseModeEnum.RDN){
                // move viewpoint by diff
                //r2.viewCtrl.pos.add(new_mouse_pt.subtract(r2App.cur_mouse_pt, true));
            }
            else if(pub.mode == r2.MouseModeEnum.RADIALMENU){
                pub.handleRadialMenuMv(event)
            }

            if(pub.mode !== r2.MouseModeEnum.RADIALMENU){
                r2App.cur_mouse_pt = new_mouse_pt;
            }
        };

        pub.handleUp = function(event){
            var new_mouse_pt = pub.getPos(event);

            if(pub.mode == r2.MouseModeEnum.HOVER){
                // do nothing, there's something gone wierd.
            }
            else if(pub.mode == r2.MouseModeEnum.LDN){
                if(r2App.mode == r2App.AppModeEnum.IDLE || r2App.mode == r2App.AppModeEnum.REPLAYING){
                    if (pub.isTap(new_mouse_pt)) {
                        pub.handleTimeIndexingUp(r2.viewCtrl.mapScrToDoc(new_mouse_pt));
                    }
                    if(r2.spotlightCtrl.recordingSpotlightUp(r2.viewCtrl.mapScrToDoc(new_mouse_pt), r2App.annot_private_spotlight)){
                        r2App.annot_private_spotlight.timeLastChanged = (new Date()).getTime();
                        r2App.annot_private_spotlight.changed = true;
                    }
                }
                else if(r2App.mode == r2App.AppModeEnum.RECORDING){
                    r2.spotlightCtrl.recordingSpotlightUp(r2.viewCtrl.mapScrToDoc(new_mouse_pt), r2App.cur_recording_annot);
                }
                pub.mode = r2.MouseModeEnum.HOVER;
            }
            else if(pub.mode == r2.MouseModeEnum.RDN){
                if(r2App.mode == r2App.AppModeEnum.IDLE || r2App.mode == r2App.AppModeEnum.REPLAYING){
                    if (pub.isTap(new_mouse_pt)) {
                        pub.handleTimeIndexingUp(r2.viewCtrl.mapScrToDoc(new_mouse_pt));
                    }
                    else {
                        r2.log.Log_Nav("mouse");
                    }
                }
                pub.mode = r2.MouseModeEnum.HOVER;
            }
            else if(pub.mode == r2.MouseModeEnum.RADIALMENU){
                pub.handleRadialMenuUp(event);
            }

            r2App.cur_mouse_pt = new_mouse_pt;
        };

        pub.handleRadialMenuMv = function(event){
            if (r2App.selected_radialmenu && event.which == 1) {
                var pt = r2.viewCtrl.mapScrToDoc(pub.getPos(event));
                r2App.selected_radialmenu.OnMouseDrag(pt);
                return true;
            }
            else {
                return false;
            }
        };

        pub.handleRadialMenuUp = function(event){
            if (r2App.selected_radialmenu && event.which == 1) {
                var pt = r2.viewCtrl.mapScrToDoc(pub.getPos(event));
                r2App.selected_radialmenu.OnMouseUp_MenuItem(pt);
                return true;
            }
            return false;
        };


        pub.handleTimeIndexingUp = function(pt){
            var l = r2App.cur_page.HitTest(pt);
            if(l.length == 0){return;}

            var obj_front = l[0];
            if(obj_front instanceof r2.PieceAudio){
                var playback = obj_front.GetPlayback(pt);
                if(playback){
                    r2.rich_audio.play(playback.annot, playback.t);
                    r2.log.Log_AudioPlay('indexing_wf', playback.annot, playback.t);
                }
            }
            else if(obj_front instanceof r2.PieceKeyboard){
                obj_front.Focus();
            }
            else{
                var spotlights = [];
                l.forEach(function(item){if(item instanceof r2.Spotlight.Cache){spotlights.push(item);}});
                for(var i = 0; spotlight = spotlights[i]; ++i){
                    var playback = spotlight.GetPlayback(pt);
                    if(playback){
                        r2.rich_audio.play(playback.annot, playback.t);
                        r2.log.Log_AudioPlay('indexing_sp', playback.annot, playback.t);
                        break;
                    }
                }
            }
        };

        return pub;
    }());


    r2.KeyboardModeEnum = {
        FOCUSED : 0,
        NORMAL : 1
    };

    r2.keyboard = (function(){
        var pub = {};

        pub.mode = r2.KeyboardModeEnum.NORMAL;
        pub.ctrlkey_dn = false;

        pub.handleDn = function(event){
            if(r2App.mode == r2App.AppModeEnum.IDLE && pub.mode == r2.KeyboardModeEnum.NORMAL){
                switch(event.which){
                    case 17: // left ctrl
                    case 25: // rght ctrl
                        pub.ctrlkey_dn = true;
                        break;
                    case 37:
                        r2.clickPrevPage();
                        break;
                    case 39:
                        r2.clickNextPage();
                        break;
                    default:
                        break;
                }
            }
            if(r2App.mode == r2App.AppModeEnum.REPLAYING && pub.mode == r2.KeyboardModeEnum.NORMAL){
                switch(event.which){
                    case 17: // left ctrl
                    case 25: // rght ctrl
                        pub.ctrlkey_dn = true;
                        break;
                    case 37:
                        r2.clickPrevPage();
                        break;
                    case 39:
                        r2.clickNextPage();
                        break;
                    default:
                        break;
                }
            }
            else if(r2App.mode == r2App.AppModeEnum.RECORDING){
                if(event.which == 13 || event.which == 32){ // enter or space
                    // for Recording_Stop() when key up;
                }
                else{
                    if(r2App.cur_recording_pieceaudios.length == 1){
                        replacePieceAudioToPieceKeyboard();
                    }
                }
            }

            if( pub.mode === r2.KeyboardModeEnum.NORMAL &&
                    (event.which === 13 || event.which === 32) ){
                event.preventDefault();
                event.stopPropagation();
            }
        };

        pub.handleUp = function(event){
            var key_str = String.fromCharCode(event.which);
            if (r2App.mode == r2App.AppModeEnum.IDLE && pub.mode == r2.KeyboardModeEnum.NORMAL) {
                switch (key_str) {
                    case ' ':
                        if (r2App.cur_annot_id) {
                            r2.rich_audio.play(r2App.cur_annot_id, -1);
                            r2.log.Log_AudioPlay('space', r2App.cur_annot_id, r2.audioPlayer.getPlaybackTime());
                        }
                        break;
                    case '\r': // enter
                        if (pub.ctrlkey_dn) {
                            createPieceKeyboard(isprivate = true);
                            r2.log.Log_Simple("CreatePieceKeyboard_Private_Enter");
                        }
                        else {
                            r2App.recording_trigger = true;
                            r2.log.Log_Simple("Recording_Bgn_Enter");
                        }
                        break;
                    default:
                        break;
                }
            }
            else if (r2App.mode == r2App.AppModeEnum.REPLAYING && pub.mode == r2.KeyboardModeEnum.NORMAL) {
                switch (key_str) {
                    case ' ':
                        r2.log.Log_AudioStop('space', r2.audioPlayer.getCurAudioFileId(), r2.audioPlayer.getPlaybackTime());
                        r2.rich_audio.stop();
                        break;
                    case '\r': // enter
                        r2.log.Log_AudioStop('enter_0', r2.audioPlayer.getCurAudioFileId(), r2.audioPlayer.getPlaybackTime());
                        r2.rich_audio.stop();
                        if (pub.ctrlkey_dn) {
                            createPieceKeyboard(isprivate = true);
                            r2.log.Log_Simple("CreatePieceKeyboard_Private_Enter");
                        }
                        else {
                            r2App.recording_trigger = true;
                            r2.log.Log_Simple("Recording_Bgn_Enter");
                        }
                        break;
                    default:
                        break;
                }
            }
            else if(r2App.mode == r2App.AppModeEnum.RECORDING) {
                if (event.which == 13 || event.which == 32) { // enter or space
                    r2.recordingStop(toupload = true);
                    r2.log.Log_Simple("Recording_Stop_Enter");
                }
            }

            switch(event.which){
                case 17: // left ctrl
                case 25: // rght ctrl
                    pub.ctrlkey_dn = false;
                    break;
                case 107:
                    if(pub.mode == r2.KeyboardModeEnum.NORMAL)
                        r2.clickZoomIn();
                    break;
                case 109:
                    if(pub.mode == r2.KeyboardModeEnum.NORMAL)
                        r2.clickZoomOut();
                    break;
                default:
                    break;
            }
        };

        document.onkeyup = pub.handleUp;
        document.onkeydown = pub.handleDn;

        return pub;
    }());

    r2.onScreenButtons = (function(){
        var pub = {};

        var modeEnum = {
            HIDDEN : 0,
            VISIBLE : 1
        };
        var VERTICAL_DRAG_CRITERIA = 0.03;

        r2.HtmlTemplate.add('onscrbtns');

        var mode = modeEnum.HIDDEN;
        var show_pos_x = 0.0;

        var $btns_dom = null;
        var $voice_btn_dom = null;
        var $text_btn_dom = null;


        pub.Init = function(){
            $btns_dom = $('#onscrbtns');
            $voice_btn_dom = $btns_dom.find('.voice_comment_btn');
            $text_btn_dom = $btns_dom.find('.text_comment_btn');
        };

        pub.SetUserColor = function(user){
            $voice_btn_dom.mouseover(function(){
                $voice_btn_dom.find('.fa-btn-bg').css('color', user.color_onscrbtn_hover);
                $voice_btn_dom.find('span').css('color', user.color_onscrbtn_hover);
            });
            $voice_btn_dom.mouseout(function(){
                $voice_btn_dom.find('.fa-btn-bg').css('color', user.color_onscrbtn_normal);
                $voice_btn_dom.find('span').css('color', user.color_onscrbtn_normal);
            });
            $voice_btn_dom.mouseup(function(event){
                event.preventDefault();
                if(event.which != 1 || r2.keyboard.ctrlkey_dn){return;}
                if(r2App.mode == r2App.AppModeEnum.RECORDING){
                    r2.recordingStop(toupload = true);
                    r2.log.Log_Simple("Recording_Stop_OnScrBtn");
                }
                else{
                    r2App.recording_trigger = true;
                    r2.log.Log_Simple("Recording_Bgn_OnScrBtn");
                }
                pub.mode = r2.MouseModeEnum.HOVER; // should set mouse mode here, since we are calling stopPropagation().
                hideDom();
            });

            $text_btn_dom.mouseover(function(){
                $text_btn_dom.find('.fa-btn-bg').css('color', user.color_onscrbtn_hover);
                $text_btn_dom.find('span').css('color', user.color_onscrbtn_hover);
            });
            $text_btn_dom.mouseout(function(){
                $text_btn_dom.find('.fa-btn-bg').css('color', user.color_onscrbtn_normal);
                $text_btn_dom.find('span').css('color', user.color_onscrbtn_normal);
            });
            $text_btn_dom.mouseup(function(event){
                event.preventDefault();

                if(event.which != 1 || r2.keyboard.ctrlkey_dn){return;}
                createPieceKeyboard(isprivate = r2.keyboard.ctrlkey_dn);
                if(r2.keyboard.ctrlkey_dn){
                    r2.log.Log_Simple("CreatePieceKeyboard_Private_OnScrBtn");
                }
                else{
                    r2.log.Log_Simple("CreatePieceKeyboard_Public_OnScrBtn");
                }
                pub.mode = r2.MouseModeEnum.HOVER; // should set mouse mode here, since we are calling stopPropagation().
                hideDom();
            })


        };

        pub.ResizeDom = function(){

        };

        pub.updateDom = function(){

        };

        pub.drawDnMv = function(mouse_dn, mouse_mv){
            if(mode === modeEnum.VISIBLE){
                if(mouse_mv.y < mouse_dn.y + VERTICAL_DRAG_CRITERIA){
                    mode = modeEnum.HIDDEN;
                    hideDom();
                }
                else{
                    moveDom(show_pos_x, mouse_mv.y);
                }
            }
            else if(mode === modeEnum.HIDDEN){
                if(mouse_mv.y > mouse_dn.y + VERTICAL_DRAG_CRITERIA){
                    show_pos_x = mouse_mv.x;
                    mode = modeEnum.VISIBLE;
                    showDom();
                    moveDom(mouse_mv);
                }
            }
        };

        var hideDom = function(){
            $btns_dom.css('display', 'none');
        };

        var showDom = function(){
            $btns_dom.css('display', 'inline-block');
            $btns_dom[0].focus();
        };

        var moveDom = function(x, y){
            var pos = r2.viewCtrl.mapDocToDom(Vec2(x, y));
            $btns_dom.css('left', Math.floor(pos.x) + 'px');
            $btns_dom.css('top', Math.floor(pos.y)+ 'px');
            mode = modeEnum.VISIBLE;
        };

        return pub;
    })();

    r2.spotlightCtrl = (function(){
        var pub = {};

        var cur_recording_spotlight = null;
        var cur_recording_spotlight_segment = null;
        var cur_recording_spotlight_segment_piece = null;
        var cur_recording_spotlight_pt = null;

        pub.nowRecording = function(){
            return cur_recording_spotlight !== null;
        };

        pub.drawDynamicSceneBlob = function(canv_ctx, isprivate, color){
            if(cur_recording_spotlight_pt){
                r2.Spotlight.Cache.prototype.drawMovingBlob(
                    cur_recording_spotlight_pt,
                    cur_recording_spotlight_pt,
                    isprivate,
                    color,
                    canv_ctx
                );
            }
        };

        pub.drawDynamicSceneTraces = function(canv_ctx){
            if(cur_recording_spotlight !== null)
                cur_recording_spotlight.Draw(canv_ctx);
        };

        pub.recordingSpotlightDn = function(pt, target_annot){
            var piece = r2App.cur_page.GetPieceByHitTest(pt);
            if(piece){
                var spotlight = new r2.Spotlight();
                spotlight.SetSpotlight(
                    target_annot.GetUsername(),
                    target_annot.GetId(),
                    r2App.cur_pdf_pagen,
                    r2App.cur_time,
                    r2App.cur_time-target_annot.GetBgnTime(),
                    r2App.cur_time-target_annot.GetBgnTime());

                var segment  = new r2.Spotlight.Segment();
                segment.SetSegment(piece.GetId(), [pt.subtract(piece.pos, true)]);

                spotlight.AddSegment(segment);

                cur_recording_spotlight = spotlight;
                cur_recording_spotlight_segment = segment;
                cur_recording_spotlight_segment_piece = piece;
                cur_recording_spotlight_pt = pt;
            }
        };
        pub.recordingSpotlightMv = function(pt, target_annot){
            if(cur_recording_spotlight && cur_recording_spotlight_segment){
                var piece = r2App.cur_page.GetPieceByHitTest(pt);
                if(piece === cur_recording_spotlight_segment_piece){
                    if(piece){
                        // add point
                        cur_recording_spotlight_segment.AddPt(pt.subtract(piece.pos, true));
                        cur_recording_spotlight.t_end = r2App.cur_time-target_annot.GetBgnTime();
                    }
                    else{
                        // cut segment
                        cur_recording_spotlight_segment = null;
                    }
                }
                else{
                    // cut segment
                    cur_recording_spotlight_segment = null;
                    if(piece){
                        // add new segment and add point
                        var segment  = new r2.Spotlight.Segment();
                        segment.SetSegment(piece.GetId(), [pt.subtract(piece.pos, true)]);
                        if(segment.GetNumPts()>0){
                            cur_recording_spotlight.AddSegment(segment);
                        }
                        cur_recording_spotlight_segment = segment;
                        cur_recording_spotlight.t_end = r2App.cur_time-target_annot.GetBgnTime();
                    }
                }
                cur_recording_spotlight_segment_piece = piece;
                cur_recording_spotlight_pt = pt;
            }
        };

        pub.recordingSpotlightUp = function(pt, target_annot){
            if(cur_recording_spotlight){
                if(cur_recording_spotlight_segment){
                    cur_recording_spotlight_segment = null;
                }
                if(cur_recording_spotlight.segments.length>0){
                    target_annot.AddSpotlight(cur_recording_spotlight, toupload = true);
                }
                cur_recording_spotlight_pt = null;
                r2App.cur_page.refreshSpotlightPrerender();

                cur_recording_spotlight = null;
                r2App.invalidate_static_scene = true;
                r2App.invalidate_dynamic_scene = true;
                return true;
            }
            else{
                cur_recording_spotlight = null;
                return false;
            }
        };

        return pub;
    }());

    var replacePieceAudioToPieceKeyboard = function(){
        var annotid = r2App.cur_recording_annot.GetId();
        r2.recordingStop(toupload = false);
        r2.log.Log_Simple("Recording_Stop_CancelForTextComment");
        r2.log.Log_Simple("CreatePieceKeyboard_Public_Enter");
        r2.removeAnnot(annotid, askuser = false, mute = true);
        createPieceKeyboard(isprivate = false);
    };

    var createPieceKeyboard = function(isprivate){
        var anchorpiece = null;
        if(r2App.mode == r2App.AppModeEnum.REPLAYING){
            r2.log.Log_AudioStop('enter', r2.audioPlayer.getCurAudioFileId(), r2.audioPlayer.getPlaybackTime());
            r2.rich_audio.stop();
            anchorpiece = r2App.cur_page.SearchPieceAudioByAnnotId(this._annotid, r2.audioPlayer.getPlaybackTime());
        }
        else if(r2App.mode == r2App.AppModeEnum.IDLE){
            anchorpiece = r2App.pieceSelector.get();
        }
        if(anchorpiece){
            var annotid = new Date(r2App.cur_time).toISOString();
            var piecekeyboard = new r2.PieceKeyboard();
            piecekeyboard.SetPiece(
                Sha1.hash(annotid+" PieceKeyboard 0"),
                r2App.cur_time,
                anchorpiece.GetNewPieceSize(),
                anchorpiece.GetTTData());
            piecekeyboard.SetPieceKeyboard(annotid, r2.userGroup.cur_user.name, '', isprivate, anchorpiece.IsOnLeftColumn());
            anchorpiece.AddChildAtFront(piecekeyboard);
            r2App.cur_page.Relayout();
            piecekeyboard.updateDom();
            piecekeyboard.Focus();
            r2Sync.PushToUploadCmd(piecekeyboard.ExportToCmd());

            // reposition docs so that the textarea lies on the screen
            /*
            var shiftx = 0;
            if(isprivate){
                shiftx = piecekeyboard.GetPrivateShiftX();
            }
            var doc_l = piecekeyboard.pos.add(new Vec2(shiftx, 0), true);
            var scr_l = r2.viewCtrl.mapDocToScr(doc_l);
            var doc_r = piecekeyboard.pos.add(piecekeyboard.GetContentSize(), true).add(new Vec2(shiftx, 0), true);
            var scr_r = r2.viewCtrl.mapDocToScr(doc_r);
            if(scr_l.x < 0){
                r2.viewCtrl.pos.x = -r2.viewCtrl.scale*doc_l.x;
            }
            else if(scr_r.x > 1.0){
                r2.viewCtrl.pos.x = 1.0-r2.viewCtrl.scale*doc_r.x
            }
            */
        }
    };

}(window.r2 = window.r2 || {}));
