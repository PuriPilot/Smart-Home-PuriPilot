
/*
 * Camera Buttons
 */

var CameraButtons = function(blueprint3d) {

  var orbitControls = blueprint3d.three.controls;
  var three = blueprint3d.three;

  var panSpeed = 30;
  var directions = {
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
  }

  function init() {
    // Camera controls
    $("#zoom-in").click(zoomIn);
    $("#zoom-out").click(zoomOut);  
    $("#zoom-in").dblclick(preventDefault);
    $("#zoom-out").dblclick(preventDefault);

    $("#reset-view").click(three.centerCamera)

    $("#move-left").click(function(){
      pan(directions.LEFT)
    })
    $("#move-right").click(function(){
      pan(directions.RIGHT)
    })
    $("#move-up").click(function(){
      pan(directions.UP)
    })
    $("#move-down").click(function(){
      pan(directions.DOWN)
    })

    $("#move-left").dblclick(preventDefault);
    $("#move-right").dblclick(preventDefault);
    $("#move-up").dblclick(preventDefault);
    $("#move-down").dblclick(preventDefault);
  }

  function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function pan(direction) {
    switch (direction) {
      case directions.UP:
        orbitControls.panXY(0, panSpeed);
        break;
      case directions.DOWN:
        orbitControls.panXY(0, -panSpeed);
        break;
      case directions.LEFT:
        orbitControls.panXY(panSpeed, 0);
        break;
      case directions.RIGHT:
        orbitControls.panXY(-panSpeed, 0);
        break;
    }
  }

  function zoomIn(e) {
    e.preventDefault();
    orbitControls.dollyIn(1.1);
    orbitControls.update();
  }

  function zoomOut(e) {
    e.preventDefault;
    orbitControls.dollyOut(1.1);
    orbitControls.update();
  }

  init();
}

/*
 * Context menu for selected item
 */ 

var ContextMenu = function(blueprint3d) {

  var scope = this;
  var selectedItem;
  var three = blueprint3d.three;

  function init() {
    $("#context-menu-delete").click(function(event) {
        selectedItem.remove();
    });

    three.itemSelectedCallbacks.add(itemSelected);
    three.itemUnselectedCallbacks.add(itemUnselected);

    initResize();

    $("#fixed").click(function() {
        var checked = $(this).prop('checked');
        selectedItem.setFixed(checked);
    });
  }

  function cmToIn(cm) {
    return cm / 2.54;
  }

  function inToCm(inches) {
    return inches * 2.54;
  }

  function itemSelected(item) {
    selectedItem = item;

    $("#context-menu-name").text(item.metadata.itemName);

    $("#item-width").val(cmToIn(selectedItem.getWidth()).toFixed(0));
    $("#item-height").val(cmToIn(selectedItem.getHeight()).toFixed(0));
    $("#item-depth").val(cmToIn(selectedItem.getDepth()).toFixed(0));

    $("#context-menu").show();

    $("#fixed").prop('checked', item.fixed);
  }

  function resize() {
    selectedItem.resize(
      inToCm($("#item-height").val()),
      inToCm($("#item-width").val()),
      inToCm($("#item-depth").val())
    );
  }

  function initResize() {
    $("#item-height").change(resize);
    $("#item-width").change(resize);
    $("#item-depth").change(resize);
  }

  function itemUnselected() {
    selectedItem = null;
    $("#context-menu").hide();
  }

  init();
}

/*
 * Loading modal for items
 */

var ModalEffects = function(blueprint3d) {

  var scope = this;
  var blueprint3d = blueprint3d;
  var itemsLoading = 0;

  this.setActiveItem = function(active) {
    itemSelected = active;
    update();
  }

  function update() {
    if (itemsLoading > 0) {
      $("#loading-modal").show();
    } else {
      $("#loading-modal").hide();
    }
  }

  function init() {
    blueprint3d.model.scene.itemLoadingCallbacks.add(function() {
      itemsLoading += 1;
      update();
    });

     blueprint3d.model.scene.itemLoadedCallbacks.add(function() {
      itemsLoading -= 1;
      update();
    });   

    update();
  }

  init();
}

/*
 * Side menu
 */

var SideMenu = function(blueprint3d, floorplanControls, modalEffects) {
  var blueprint3d = blueprint3d;
  var floorplanControls = floorplanControls;
  var modalEffects = modalEffects;

  var ACTIVE_CLASS = "active";

  var tabs = {
    "FLOORPLAN" : $("#floorplan_tab"),
    "SHOP" : $("#items_tab"),
    "DESIGN" : $("#design_tab")
  }

  var scope = this;
  this.stateChangeCallbacks = $.Callbacks();

  this.states = {
    "DEFAULT" : {
      "div" : $("#viewer"),
      "tab" : tabs.DESIGN
    },
    "FLOORPLAN" : {
      "div" : $("#floorplanner"),
      "tab" : tabs.FLOORPLAN
    },
    "SHOP" : {
      "div" : $("#add-items"),
      "tab" : tabs.SHOP
    }
  }

  // sidebar state
  var currentState = scope.states.FLOORPLAN;

  function init() {
    for (var tab in tabs) {
      var elem = tabs[tab];
      elem.click(tabClicked(elem));
    }

    $("#update-floorplan").click(floorplanUpdate);

    initLeftMenu();

    blueprint3d.three.updateWindowSize();
    handleWindowResize();

    initItems();

    setCurrentState(scope.states.DEFAULT);
  }

  function floorplanUpdate() {
    setCurrentState(scope.states.DEFAULT);
  }

  function tabClicked(tab) {
    return function() {
      // Stop three from spinning
      blueprint3d.three.stopSpin();

      // Selected a new tab
      for (var key in scope.states) {
        var state = scope.states[key];
        if (state.tab == tab) {
          setCurrentState(state);
          break;
        }
      }
    }
  }
  
  function setCurrentState(newState) {

    if (currentState == newState) {
      return;
    }

    // show the right tab as active
    if (currentState.tab !== newState.tab) {
      if (currentState.tab != null) {
        currentState.tab.removeClass(ACTIVE_CLASS);          
      }
      if (newState.tab != null) {
        newState.tab.addClass(ACTIVE_CLASS);
      }
    }

    // set item unselected
    blueprint3d.three.getController().setSelectedObject(null);

    // show and hide the right divs
    currentState.div.hide()
    newState.div.show()

    // custom actions
    if (newState == scope.states.FLOORPLAN) {
      floorplanControls.updateFloorplanView();
      floorplanControls.handleWindowResize();
    } 

    if (currentState == scope.states.FLOORPLAN) {
      blueprint3d.model.floorplan.update();
    }

    if (newState == scope.states.DEFAULT) {
      blueprint3d.three.updateWindowSize();
    }
 
    // set new state
    handleWindowResize();    
    currentState = newState;

    scope.stateChangeCallbacks.fire(newState);
  }

  function initLeftMenu() {
    $( window ).resize( handleWindowResize );
    handleWindowResize();
  }

  function handleWindowResize() {
    $(".sidebar").height(window.innerHeight);
    $("#add-items").height(window.innerHeight);

  };

  // TODO: this doesn't really belong here
  function initItems() {
    $("#add-items").find(".add-item").mousedown(async function(e) {
      e.preventDefault();
      var modelUrl = $(this).attr("model-url");
      var itemType = parseInt($(this).attr("model-type"));
      var metadata = {
        itemName: $(this).attr("model-name"),
        resizable: true,
        modelUrl: modelUrl,
        itemType: itemType,
        deviceId: $(this).data("device-id") || null,
        deviceTemplate: $(this).data("device-template") || null
      }

      if (metadata.deviceTemplate && !metadata.deviceId) {
        if (window.createDevice) {
          var created = await window.createDevice(metadata.itemName);
          if (created && created.id) {
            metadata.deviceId = created.id;
          }
        }
      }

      blueprint3d.model.scene.addItem(itemType, modelUrl, metadata);
      setCurrentState(scope.states.DEFAULT);
    });
  }

  init();

}

/*
 * Change floor and wall textures
 */

var TextureSelector = function (blueprint3d, sideMenu) {

  var scope = this;
  var three = blueprint3d.three;
  var isAdmin = isAdmin;

  var currentTarget = null;

  function initTextureSelectors() {
    $(".texture-select-thumbnail").click(function(e) {
      var textureUrl = $(this).attr("texture-url");
      var textureStretch = ($(this).attr("texture-stretch") == "true");
      var textureScale = parseInt($(this).attr("texture-scale"));
      currentTarget.setTexture(textureUrl, textureStretch, textureScale);

      e.preventDefault();
    });
  }

  function init() {
    three.wallClicked.add(wallClicked);
    three.floorClicked.add(floorClicked);
    three.itemSelectedCallbacks.add(reset);
    three.nothingClicked.add(reset);
    sideMenu.stateChangeCallbacks.add(reset);
    initTextureSelectors();
  }

  function wallClicked(halfEdge) {
    currentTarget = halfEdge;
    $("#floorTexturesDiv").hide();  
    $("#wallTextures").show();  
  }

  function floorClicked(room) {
    currentTarget = room;
    $("#wallTextures").hide();  
    $("#floorTexturesDiv").show();  
  }

  function reset() {
    $("#wallTextures").hide();  
    $("#floorTexturesDiv").hide();  
  }

  init();
}

/*
 * Floorplanner controls
 */

var ViewerFloorplanner = function(blueprint3d) {

  var canvasWrapper = '#floorplanner';

  // buttons
  var move = '#move';
  var remove = '#delete';
  var draw = '#draw';

  var activeStlye = 'btn-primary disabled';

  this.floorplanner = blueprint3d.floorplanner;

  var scope = this;

  function init() {

    $( window ).resize( scope.handleWindowResize );
    scope.handleWindowResize();

    // mode buttons
    scope.floorplanner.modeResetCallbacks.add(function(mode) {
      $(draw).removeClass(activeStlye);
      $(remove).removeClass(activeStlye);
      $(move).removeClass(activeStlye);
      if (mode == BP3D.Floorplanner.floorplannerModes.MOVE) {
          $(move).addClass(activeStlye);
      } else if (mode == BP3D.Floorplanner.floorplannerModes.DRAW) {
          $(draw).addClass(activeStlye);
      } else if (mode == BP3D.Floorplanner.floorplannerModes.DELETE) {
          $(remove).addClass(activeStlye);
      }

      if (mode == BP3D.Floorplanner.floorplannerModes.DRAW) {
        $("#draw-walls-hint").show();
        scope.handleWindowResize();
      } else {
        $("#draw-walls-hint").hide();
      }
    });

    $(move).click(function(){
      scope.floorplanner.setMode(BP3D.Floorplanner.floorplannerModes.MOVE);
    });

    $(draw).click(function(){
      scope.floorplanner.setMode(BP3D.Floorplanner.floorplannerModes.DRAW);
    });

    $(remove).click(function(){
      scope.floorplanner.setMode(BP3D.Floorplanner.floorplannerModes.DELETE);
    });
  }

  this.updateFloorplanView = function() {
    scope.floorplanner.reset();
  }

  this.handleWindowResize = function() {
    $(canvasWrapper).height(window.innerHeight - $(canvasWrapper).offset().top);
    scope.floorplanner.resizeView();
  };

  init();
}; 

var mainControls = function(blueprint3d) {
  var blueprint3d = blueprint3d;

  function newDesign() {
    blueprint3d.model.loadSerialized('{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":204.85099999999989,"y":289.052},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":672.2109999999999,"y":289.052},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":672.2109999999999,"y":-178.308},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":204.85099999999989,"y":-178.308}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[]}');
  }

  function loadDesign() {
    files = $("#loadFile").get(0).files;
    var reader  = new FileReader();
    reader.onload = function(event) {
        var data = event.target.result;
        blueprint3d.model.loadSerialized(data);
    }
    reader.readAsText(files[0]);
  }

  function saveDesign() {
    var data = blueprint3d.model.exportSerialized();
    var a = window.document.createElement('a');
    var blob = new Blob([data], {type : 'text'});
    a.href = window.URL.createObjectURL(blob);
    a.download = 'design.blueprint3d';
    document.body.appendChild(a)
    a.click();
    document.body.removeChild(a)
  }

  function init() {
    $("#new").click(newDesign);
    $("#loadFile").change(loadDesign);
    $("#saveFile").click(saveDesign);
  }

  init();
}

/*
 * Initialize!
 */

$(document).ready(function() {

  var API_BASE = 'http://localhost:3001/api';
  var DEFAULT_SCENE = '{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":204.85099999999989,"y":289.052},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":672.2109999999999,"y":289.052},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":672.2109999999999,"y":-178.308},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":204.85099999999989,"y":-178.308}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[]}';
  var currentFloorplanId = null;
  var autosaveDirty = false;
  var saving = false;
  var deviceCache = {};
  var bubbleState = { item: null, deviceId: null };

  // main setup
  var opts = {
    floorplannerElement: 'floorplanner-canvas',
    threeElement: '#viewer',
    threeCanvasElement: 'three-canvas',
    textureDir: "models/textures/",
    widget: false
  }
  var blueprint3d = new BP3D.Blueprint3d(opts);

  var modalEffects = new ModalEffects(blueprint3d);
  var viewerFloorplanner = new ViewerFloorplanner(blueprint3d);
  var contextMenu = new ContextMenu(blueprint3d);
  var sideMenu = new SideMenu(blueprint3d, viewerFloorplanner, modalEffects);
  var textureSelector = new TextureSelector(blueprint3d, sideMenu);        
  var cameraButtons = new CameraButtons(blueprint3d);
  mainControls(blueprint3d);

  function serializeScene() {
    var items = blueprint3d.model.scene.getItems().map(function (object) {
      return {
        item_name: object.metadata.itemName,
        item_type: object.metadata.itemType,
        model_url: object.metadata.modelUrl,
        device_id: object.metadata.deviceId || null,
        xpos: object.position.x,
        ypos: object.position.y,
        zpos: object.position.z,
        rotation: object.rotation.y,
        scale_x: object.scale.x,
        scale_y: object.scale.y,
        scale_z: object.scale.z,
        fixed: object.fixed
      };
    });

    var payload = {
      floorplan: blueprint3d.model.floorplan.saveFloorplan(),
      items: items
    };
    return JSON.stringify(payload);
  }

  function loadScene(serialized) {
    var data = serialized;
    if (typeof serialized === 'string') {
      try {
        data = JSON.parse(serialized);
      } catch (e) {
        return;
      }
    }
    blueprint3d.model.scene.clearItems();
    blueprint3d.model.floorplan.loadFloorplan(data.floorplan || {});
    (data.items || []).forEach(function (item) {
      var position = new THREE.Vector3(item.xpos || 0, item.ypos || 0, item.zpos || 0);
      var metadata = {
        itemName: item.item_name,
        resizable: true,
        itemType: item.item_type,
        modelUrl: item.model_url,
        deviceId: item.device_id || null
      };
      var scale = new THREE.Vector3(item.scale_x || 1, item.scale_y || 1, item.scale_z || 1);
      blueprint3d.model.scene.addItem(item.item_type, item.model_url, metadata, position, item.rotation || 0, scale, item.fixed);
    });
  }

  async function loadInitial() {
    try {
      var res = await fetch(API_BASE + '/floorplans/latest/current');
      if (res.ok) {
        var data = await res.json();
        currentFloorplanId = data.id;
        loadScene(data.data);
        autosaveDirty = false;
        return;
      }
    } catch (err) {}
    loadScene(DEFAULT_SCENE);
    autosaveDirty = true;
  }

  function markDirty(reason) {
    autosaveDirty = true;
  }

  // expose device creator for Add Items handlers
  window.createDevice = createDevice;

  async function saveFloorplan(reason) {
    if (saving || !autosaveDirty) return;
    saving = true;
    var payload = {
      id: currentFloorplanId,
      name: 'Current Floorplan',
      data: serializeScene()
    };
    var url = currentFloorplanId ? (API_BASE + '/floorplans/' + currentFloorplanId) : (API_BASE + '/floorplans');
    var method = currentFloorplanId ? 'PUT' : 'POST';
    try {
      var res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        var data = await res.json();
        currentFloorplanId = data.id;
        autosaveDirty = false;
      }
    } catch (err) {
    } finally {
      saving = false;
    }
  }

  async function fetchDevice(deviceId) {
    if (!deviceId) return null;
    if (deviceCache[deviceId]) return deviceCache[deviceId];
    try {
      var res = await fetch(API_BASE + '/devices/' + deviceId);
      if (res.ok) {
        var dev = await res.json();
        deviceCache[deviceId] = dev;
        return dev;
      }
    } catch (err) {}
    return null;
  }

  function setBubbleFields(item, device) {
    var bubble = $('#device-bubble');
    $('#device-bubble-name').text(item.metadata.itemName || 'Device');
    $('#device-bubble-id').text(item.metadata.deviceId ? ('#' + item.metadata.deviceId) : '');
    $('#device-bubble-mode').text(device && device.mode ? device.mode : '-');
    $('#device-bubble-smell').text(device && device.smell_class ? device.smell_class : '-');
    $('#device-bubble-last').text(device && device.last_seen ? device.last_seen : '-');
    $('#device-bubble-name-input').val(device && device.name ? device.name : (item.metadata.itemName || 'Device'));
    bubble.show();
    updateBubblePosition();

    var mode = device && device.mode ? device.mode : null;
    $('.device-mode-btn').removeClass('btn-primary');
    if (mode) {
      $('.device-mode-btn[data-mode="' + mode + '"]').addClass('btn-primary');
    }
  }

  async function createDevice(name) {
    try {
      var res = await fetch(API_BASE + '/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'Lg Puricare' })
      });
      if (res.ok) {
        var dev = await res.json();
        deviceCache[dev.id] = dev;
        return dev;
      }
    } catch (err) {}
    return null;
  }

  function hideBubble() {
    bubbleState = { item: null, deviceId: null };
    $('#device-bubble').hide();
  }

  function updateBubblePosition() {
    if (!bubbleState.item) return;
    var vector = bubbleState.item.position.clone();
    vector.project(blueprint3d.three.getCamera());

    var viewer = $('#viewer')[0];
    var rect = viewer ? viewer.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

    var x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
    var y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;

    var bubble = $('#device-bubble');
    var bubbleWidth = bubble.outerWidth() || 0;
    var bubbleHeight = bubble.outerHeight() || 0;

    bubble.css({
      left: Math.round(x - (bubbleWidth / 2) + 4) + 'px',
      top: Math.round(y - bubbleHeight + 10) + 'px'
    });
  }

  function onItemSelected(item) {
    if (!item.metadata || !item.metadata.deviceId) {
      hideBubble();
      return;
    }
    bubbleState = { item: item, deviceId: item.metadata.deviceId };
    fetchDevice(item.metadata.deviceId).then(function (device) {
      setBubbleFields(item, device);
    }).catch(function () {
      setBubbleFields(item, null);
    });
  }

  function bindDeviceControls() {
    $('#device-bubble').on('mousedown click', function(e){ e.stopPropagation(); });

    $('.device-mode-btn').click(async function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!bubbleState.deviceId) return;
      var mode = $(this).data('mode');
      try {
        var res = await fetch(API_BASE + '/devices/' + bubbleState.deviceId + '/mode', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: mode })
        });
        if (res.ok) {
          var dev = await res.json();
          deviceCache[bubbleState.deviceId] = dev;
          setBubbleFields(bubbleState.item, dev);
        }
      } catch (err) {}
    });

    $('#device-bubble-save-name').click(async function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!bubbleState.deviceId) return;
      var newName = $('#device-bubble-name-input').val();
      try {
        var res = await fetch(API_BASE + '/devices/' + bubbleState.deviceId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName })
        });
        if (!res.ok) {
          var text = await res.text();
          throw new Error('save failed: ' + text);
        }
        var dev = await res.json();
        deviceCache[bubbleState.deviceId] = dev;
        bubbleState.item.metadata.itemName = dev.name;
        setBubbleFields(bubbleState.item, dev);
      } catch (err) {
        console.error('Save device name failed', err);
      }
    });

    blueprint3d.three.itemSelectedCallbacks.add(onItemSelected);
    blueprint3d.three.itemUnselectedCallbacks.add(hideBubble);
  }

  function bindPersistenceEvents() {
    blueprint3d.model.scene.itemLoadedCallbacks.add(function () { markDirty('item-loaded'); });
    blueprint3d.model.scene.itemRemovedCallbacks.add(function () { markDirty('item-removed'); });
    blueprint3d.model.floorplan.fireOnUpdatedRooms(function () { markDirty('floorplan-updated'); });
    $('#update-floorplan').on('click.persist', function () { markDirty('floorplan-done'); setTimeout(function(){ saveFloorplan('floorplan-done'); }, 50); });
    $(document).on('mouseup.persist', function () { markDirty('interaction'); });
  }

  function rebindFileButtons() {
    $('#new').off('click').on('click', function (e) {
      e.preventDefault();
      loadScene(DEFAULT_SCENE);
      markDirty('new');
    });

    $('#loadFile').off('change').on('change', function () {
      var files = $('#loadFile').get(0).files;
      var reader = new FileReader();
      reader.onload = function (event) {
        loadScene(event.target.result);
        markDirty('load');
      };
      reader.readAsText(files[0]);
    });

    $('#saveFile').off('click').on('click', function (e) {
      e.preventDefault();
      var data = serializeScene();
      var a = window.document.createElement('a');
      var blob = new Blob([data], { type: 'text' });
      a.href = window.URL.createObjectURL(blob);
      a.download = 'design.blueprint3d';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  bindDeviceControls();
  bindPersistenceEvents();
  rebindFileButtons();
  loadInitial();

  setInterval(function () {
    if (autosaveDirty) {
      saveFloorplan('autosave');
    }
    updateBubblePosition();
  }, 1000);
});
