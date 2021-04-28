
// Initialize workers
exports.init_workers = async function (workers, instance) {
  // Add a worker
  for (let i = 0; i < workers.length; i++) {
    const worker = workers[i];
    await instance.addWorker(worker);
    assert.equal(
      await instance.isWorker(worker),
      true,
      "This address should be worker"
    );
  }
  assert.equal(
    await instance.workersCnt(),
    workers.length,
    "Count should be " + workers.length
  );
}

exports.get_workers_balance = async function(workers) {
  let data = {};
  for (let i = 0; i < workers.length; i++) {
    data[workers[i]] = await web3.eth.getBalance(workers[i]);
  }
  return data;
}
