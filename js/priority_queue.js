exports.PriorityQueue = function() {
  /*
   Queue = [
     id: unique id,
     prio: queue priority (higher = better),
     data: {} object with data which should be stored and returned,
     requesters: [] array with data for each insert (optional)
   ]
  */
  var queue = [];
  // Returned interface
  var self = {};

  //{{{ Callback handling

  // Registered callback handlers
  var updateCallbacks = [];
  var removalCallbacks = [];

  // Callback triggers
  function updateCallback(item) {
    for (var i = 0; i < updateCallbacks.length; i++)
      updateCallbacks[i].apply(this, arguments);
  }
  function removalCallback(item) {
    for (var i = 0; i < removalCallbacks.length; i++)
      removalCallbacks[i].apply(this, arguments);
  }

  // Callback registration
  self.onUpdate = function(callbackFunction) {
    updateCallbacks.push(callbackFunction);
  };
  self.onRemove = function(callbackFunction) {
    removalCallbacks.push(callbackFunction);
  };

  //}}}

  // Logging helper function.
  function log(string) {//{{{
    console.log("[PriorityQueue] " + string);
  }//}}}

  // Inserts the given item in the correct place in the queue.
  function insertSorted(item) {//{{{
    for (var i = 0; i < queue.length; i++) {
      if (item.prio > queue[i].prio) {
        queue.splice(i, 0, item);
        return;
      }
    }
    queue.push(item);
  }//}}}

  // Removes and returns a specific item from the queue.
  function removeItem(id) {//{{{
    if (!id)
      return null;

    for (var i = 0; i < queue.length; i++)
      if (id == queue[i].id)
        return queue.splice(i,1)[0];

    return null;
  }//}}}

  /**
   * Inserts/updates an item in the queue.
   */
  self.insert = function(id, data, requester) {//{{{
    log("request: " + id);

    // Update item if already present in queue
    var item = removeItem(id);
    if (item) {
      // Update data
      item.prio++;
      item.requesters.push(requester);

      // Re-insert item in correct position
      insertSorted(item);

      // Trigger callback
      updateCallback(item);
      return;
    }

    // Insert new item into queue
    item = {
      id: id,
      prio: 1,
      data: data,
      requesters: [requester]
    };

    queue.push(item);
    updateCallback(item);
  };//}}}

  /**
   * Pops a single item from the queue.
   * Returns the highest ranked item by default (no arguments).
   * Can pop a specific item if an id is provided.
   * Returns null if the queue is empty or no item with the specified id exists.
   */
  self.pop = function(id) {//{{{
    log("pop: " + id);

    if (queue.length == 0)
      return null;

    // Pop either a specific item or the highest one
    var item = removeItem(id);
    if (!item)
      item = queue.shift();

    removalCallback(item);
    return item;
  };//}}}

  /**
   * Returns the current queue.
   */
  self.all = function() {//{{{
    return queue;
  };//}}}

  /**
   * Clears the queue.
   */
  self.clear = function() {//{{{
    log("clear()");
    queue = [];
    self.removalCallback(null);
  };//}}}

  /**
   * Returns a string representation of this queue.
   */
  self.toString = function() {
    var rows = [];
    for (var i = 0; i < queue.length; i++)
      rows.push("("+queue[i].prio+") " + queue[i].id);
    return rows.join("\n");
  }

  // Return interface
  return self;
};
