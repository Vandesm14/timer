<script>
	export let block;
</script>

<div class="block">
	{#if block.type === 'timer'}
		<input type="text" class="item duration" value="0h 00m">
	{:else if block.type === 'label'}
		<p class="label">{block.label}</p>
	{/if}
</div>

<style>
	.block {
		display: flex;
		margin: 10px 0;
		padding: 10px 5px;
		width: max-content;
		border-radius: 3px;
		background-color: #222529;
	}

	.block > .item {
		margin: 0 5px;
		padding: 6px 10px;
		border: 1px solid #585a5d;
		border-radius: 3px;
		background-color: #1a1d21;
		color: inherit;
		font: inherit;
	}

	.block > .item:hover {
		border-color: #818385;
	}

	.block > .duration {
		width: calc(7ch + 4px);
	}

	.block > .label {
		padding: 6px 10px;
	}
</style>