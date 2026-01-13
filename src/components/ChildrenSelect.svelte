<script lang="ts">
	import { onMount } from "svelte";

	export let options: Array<{ value: string; label: string; avatarUrl?: string; disabled?: boolean }> = [];
	export let selectedOption: string = "";
	export let onChange: ((event: Event) => void) | undefined = undefined;
	export let placeholder: string = "Select Your Children";
	export let id: string = "children-select";
	export let label: string = "";

	let open = false;
	let rootEl: HTMLDivElement | null = null;

	function toggleDropdown() {
		open = !open;
	}
	function close() {
		open = false;
	}
	function selectItem(value: string) {
		selectedOption = value;
		open = false;
		// Create a lightweight change-like object compatible with handlers expecting e.target.value
		const synthetic = ({ target: { value } } as unknown) as Event;
		onChange && onChange(synthetic);
	}
	function onKeyToggle(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			toggleDropdown();
		}
		if (e.key === "Escape") close();
	}
	function getLabel(val: string): string {
		const found = options.find((o) => o.value === val);
		return found ? found.label : "";
	}
	function getAvatarUrl(val: string): string | undefined {
		const found = options.find((o) => o.value === val);
		return found?.avatarUrl;
	}
	function handleClickOutside(ev: MouseEvent) {
		if (open && rootEl && !rootEl.contains(ev.target as Node)) close();
	}
	onMount(() => {
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	});
</script>

<div class="container" bind:this={rootEl}>
	{#if label}
		<label class="label" for={id}>{label}</label>
	{/if}

	<button
		id={id}
		type="button"
		class="dropdown"
		aria-haspopup="listbox"
		aria-expanded={open}
		on:click={toggleDropdown}
		on:keydown={onKeyToggle}
	>
		<div class="left-content">
			{#if getAvatarUrl(selectedOption)}
				<img class="avatar-icon" src={getAvatarUrl(selectedOption)} alt={getLabel(selectedOption) || "Avatar"} />
			{:else}
				<div class="avatar-icon"></div>
			{/if}
			<span class="selected-text">{getLabel(selectedOption) || placeholder}</span>
		</div>
		<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
		</svg>
	</button>

	{#if open}
		<ul class="dropdown-list" role="listbox" aria-labelledby={id}>
			{#each options as option}
				<li>
					<button
						type="button"
						class:selected={selectedOption === option.value}
						class="item-btn"
						role="option"
						aria-selected={selectedOption === option.value}
						disabled={option.disabled}
						on:click={() => selectItem(option.value)}
					>
						<div class="item-content">
							{#if option.avatarUrl}
								<img class="item-avatar" src={option.avatarUrl} alt={option.label} />
							{:else}
								<div class="item-avatar"></div>
							{/if}
							<span>{option.label}</span>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		position: relative;
	}
	.label {
		font-size: 14px;
		font-weight: 600;
		color: #3b415c;
		margin-bottom: 8px;
	}
	.dropdown {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		height: 52px;
		background: #fff;
		border: 1.5px solid #e6ebf3;
		border-radius: 999px;
		cursor: pointer;
		box-shadow: 0 2px 12px rgba(47, 70, 110, 0.06);
		transition: border-color 0.18s, box-shadow 0.18s;
		width: 100%;
	}
	.dropdown:focus { 
		outline: none; 
		box-shadow: 0 0 0 3px rgba(67,139,255,0.12); 
		border-color: #bcd2ff; 
	}
	.dropdown:hover { 
		border-color: #cfd6ea; 
	}
	.left-content {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
	}
	.avatar-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #e0e0e0;
		flex-shrink: 0;
		object-fit: cover;
	}
	.selected-text { 
		color: #667085; 
		font-size: 15px; 
	}
	.icon { 
		pointer-events: none; 
		flex-shrink: 0;
	}
	.dropdown-list {
		position: absolute;
		top: calc(100% + 8px);
		width: 100%;
		background: #fff;
		border: 1px solid #e6ebf3;
		border-radius: 12px;
		box-shadow: 0 10px 20px rgba(40, 60, 120, 0.08);
		margin-top: 4px;
		list-style: none;
		padding: 8px;
		z-index: 100;
	}
	.dropdown-list li { 
		border-bottom: 1px solid #f2f4fa; 
	}
	.dropdown-list li:last-child { 
		border-bottom: none; 
	}
	.item-btn {
		width: 100%;
		text-align: left;
		padding: 12px 16px;
		background: transparent;
		border: none;
		font-size: 15px;
		color: #2b2d42;
		cursor: pointer;
		display: flex;
		align-items: center;
	}
	.item-content {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
	}
	.item-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #e0e0e0;
		flex-shrink: 0;
		object-fit: cover;
	}
	.item-btn:hover { 
		background: #eef4ff; 
		color: #2563eb;
		border-radius: 12px;
	}
	.selected { 
		background: #eaf2ff; 
		color: #2563eb; 
		font-weight: 600; 
	}
</style>

