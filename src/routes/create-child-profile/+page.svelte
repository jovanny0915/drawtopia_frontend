<script lang="ts">
  import BackBtn from "../../components/BackBtn.svelte";
  import ChildProfile from "../../components/ChildProfile.svelte";
  import PhotoGuideModal from "../../components/PhotoGuideModal.svelte";
  import PersonInfo from "../../components/PersonInfo.svelte";
  import EditPersonalInfo from "../../components/EditPersonalInfo.svelte";
  import RemoveChildProfile from "../../components/RemoveChildProfile.svelte";
  import { user, authLoading, isAuthenticated } from "../../lib/stores/auth";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { addNotification } from "$lib/stores/notification";
  import MobileBackBtn from "../../components/MobileBackBtn.svelte";
  import { deleteChildProfile } from "../../lib/database/childProfiles";

  let showPhotoGuideModal = false;
  let selectedAgeGroup = "";
  let isEditingChild = false;
  let editingChild: {
    id: number;
    name: string;
    avatarUrl: string;
    ageGroup?: string;
    relationship?: string;
    createdAt?: string;
  } | null = null;

  let showRemoveChildModal = false;
  let childToDelete: {
    id: number;
    name: string;
    avatarUrl: string;
    ageGroup?: string;
    relationship?: string;
    createdAt?: string;
  } | null = null;

  $: currentUser = $user;
  $: loading = $authLoading;
  $: authenticated = $isAuthenticated;
  $: userId = currentUser?.id;

  $: safeToRedirect = browser && !loading && currentUser !== undefined;

  let children: Array<{
    id: number;
    name: string;
    avatarUrl: string;
    ageGroup?: string;
    relationship?: string;
    createdAt?: string;
  }> = [];

  onMount(() => {
    if (browser) {
      setTimeout(() => {
        if (safeToRedirect && !authenticated) {
          goto("/login");
        }
      }, 100);
    }
  });

  $: if (safeToRedirect && !authenticated) {
    goto("/login");
  }

  const closePhotoGuideModal = () => {
    showPhotoGuideModal = false;
  };

  const handleEditChild = (childId: number) => {
    console.log("Edit child:", childId);
    const child = children.find((c) => c.id === childId);
    if (child) {
      editingChild = child;
      isEditingChild = true;
    }
  };

  const handleDeleteChild = (childId: number) => {
    console.log("Delete child requested:", childId);
    const child = children.find((c) => c.id === childId);
    if (child) {
      childToDelete = child;
      showRemoveChildModal = true;
    }
  };

  const handleRemoveChild = async () => {
    if (!childToDelete || !userId) {
      showRemoveChildModal = false;
      childToDelete = null;
      return;
    }

    try {
      const isCurrentlyEditing = editingChild?.id === childToDelete.id;

      const isDatabaseChild = childToDelete.id < 1000000000;

      if (isDatabaseChild) {
        const result = await deleteChildProfile(childToDelete.id, userId);
        if (result.success) {
          children = children.filter((child) => child.id !== childToDelete!.id);
          
          if (isCurrentlyEditing) {
            isEditingChild = false;
            editingChild = null;
          }
          
          addNotification({
            type: 'success',
            message: 'Child profile removed successfully'
          });
        } else {
          addNotification({
            type: 'error',
            message: result.error || 'Failed to remove child profile'
          });
        }
      } else {
        children = children.filter((child) => child.id !== childToDelete!.id);
        
        if (isCurrentlyEditing) {
          isEditingChild = false;
          editingChild = null;
        }
        
        addNotification({
          type: 'success',
          message: 'Child profile removed'
        });
      }
    } catch (error) {
      console.error('Error removing child profile:', error);
      addNotification({
        type: 'error',
        message: 'An error occurred while removing the child profile'
      });
    } finally {
      showRemoveChildModal = false;
      childToDelete = null;
    }
  };

  const handleCancelRemove = () => {
    showRemoveChildModal = false;
    childToDelete = null;
  };

  const handleCloseRemoveModal = () => {
    showRemoveChildModal = false;
    childToDelete = null;
  };

  const handleAvatarUploaded = (avatarUrl: string) => {
    console.log("Avatar uploaded successfully:", avatarUrl);
  };

  const handleAddChild = (childData: any) => {
    console.log("Adding new child:", childData);

    children = [
      ...children,
      {
        id: childData.id,
        name: childData.name,
        avatarUrl: childData.avatarUrl,
        ageGroup: childData.ageGroup,
        relationship: childData.relationship,
        createdAt: childData.createdAt,
      },
    ];

    console.log("Updated children list:", children);
  };

  const handleContinueToStoryCreation = () => {
    console.log("Continuing to story creation with saved profiles");
    goto("/dashboard");
  };

  const handleSaveChild = (data: {
    firstName: string;
    ageGroup: string;
    relationship: string;
    avatarUrl: string | null;
  }) => {
    if (editingChild) {
      children = children.map((child) =>
        child.id === editingChild!.id
          ? {
              ...child,
              name: data.firstName,
              ageGroup: data.ageGroup,
              relationship: data.relationship,
              avatarUrl: data.avatarUrl || child.avatarUrl,
            }
          : child
      );
      isEditingChild = false;
      editingChild = null;
      console.log("Child updated successfully:", data);
    }
  };

  const handleCancelEdit = () => {
    isEditingChild = false;
    editingChild = null;
  };
</script>

{#if loading || !browser}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
{:else if !authenticated || !userId}
  <div class="auth-error-container">
    <p>Please log in to access this page.</p>
  </div>
{:else}
  <div class="profile-creation-default">
    <div class="main-pane">
      <div class="navbar" style="justify-content: center;">
        <a href="/dashboard" class="logo-text-full logo-link" aria-label="Go to dashboard">
          <div class="logo-img"></div>
        </a>
      </div>
      <MobileBackBtn backText="Back" backRoute="/dashboard" />
      <div class="back-btn-container">
        <BackBtn backRoute="/dashboard" />
      </div>
      <div class="frame-5">
        <div class="frame-1">
          <div class="heading">
            <div class="create-child-profile">
              <span class="createchildprofile_span">Create Child Profile</span>
            </div>
            <div
              class="tell-us-about-your-child-so-we-can-personalize-their-drawtopia-experience"
            >
              <span
                class="tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span"
                >Tell us about your child so we can personalize their Drawtopia
                experience</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="frame-1410103829">
          <div class="frame-1410103997">
            <div class="step-1"><span class="step1_span">{children.length > 0 ? "Step 2" : "Step 1"}</span></div>
            <div><span class="f2_span">{children.length > 0 ? "2/2" : "1/2"}</span></div>
          </div>
          <div class="bar">
            <div class="bar_01" class:full={children.length > 0}></div>
          </div>
          <div class="setting-up-profile">
            <span class="settingupprofile_span">{children.length > 0 ? "Finish" : "Setting Up Profile"}</span>
          </div>
        </div>
      </div>
      {#if children.length > 0}
      <div class="frame-1410104010">
        <div class="list-of-children">
          <span class="listofchildren_span">List of Children</span>
        </div>
        <div class="frame-1410104011">
          {#each children as child (child.id)}
            <ChildProfile
              name={child.name}
              avatarUrl={child.avatarUrl}
              onEdit={() => handleEditChild(child.id)}
              onDelete={() => handleDeleteChild(child.id)}
              isEditing={isEditingChild && editingChild?.id === child.id}
            />
          {/each}
        </div>
      </div>
      {/if}
      <div class="frame-1410103818">
        {#if isEditingChild && editingChild}
          <EditPersonalInfo
            {userId}
            initialFirstName={editingChild.name}
            initialAgeGroup={editingChild.ageGroup || ""}
            initialRelationship={editingChild.relationship || "parent"}
            initialAvatarUrl={editingChild.avatarUrl}
            onSave={handleSaveChild}
            onCancel={handleCancelEdit}
          />
        {:else}
          <PersonInfo
            bind:showPhotoGuideModal
            bind:selectedAgeGroup
            onAvatarUploaded={handleAvatarUploaded}
            onAddChild={handleAddChild}
            onContinueToStoryCreation={handleContinueToStoryCreation}
            {children}
            {userId}
          />
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if showPhotoGuideModal}
  <div
    class="modal-overlay"
    on:keydown={(e) => e.key === "Escape" && closePhotoGuideModal()}
    role="dialog"
    tabindex="-1"
  >
    <div class="modal-container">
      <PhotoGuideModal onClose={closePhotoGuideModal} />
    </div>
  </div>
{/if}

{#if showRemoveChildModal}
  <RemoveChildProfile
    on:remove={handleRemoveChild}
    on:cancel={handleCancelRemove}
    on:close={handleCloseRemoveModal}
  />
{/if}

<style>
  .main-pane {
    width: 700px;
    gap: 24px;
    display: inline-flex;
    flex-direction: column;
  }
  .listofchildren_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .list-of-children {
    align-self: stretch;
  }

  .frame-1410104011 {
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .frame-1410104010 {
    align-self: stretch;
    padding: 8px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }
  .createchildprofile_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .create-child-profile {
    align-self: stretch;
  }

  .tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 21.6px;
    word-wrap: break-word;
  }

  .tell-us-about-your-child-so-we-can-personalize-their-drawtopia-experience {
    align-self: stretch;
  }

  .step1_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .step-1 {
    width: 63px;
  }

  .f2_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .bar_01 {
    width: 50%;
    height: 8px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: #438bff;
    border-radius: 12px;
    transition: width 0.3s ease;
  }

  .bar_01.full {
    width: 100%;
  }

  .settingupprofile_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .setting-up-profile {
    align-self: stretch;
  }

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410103997 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .logo-text-full {
    width: 203.32px;
    height: 38px;
    min-height: 38px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-link {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }
  .logo-img {
    background-image: url("../../assets/logo.webp");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
  .bar {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #eef6ff;
    overflow: hidden;
    border-radius: 12px;
  }

  .frame-1 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: flex;
  }

  .navbar {
    align-self: stretch;
    height: 79px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    border-radius: 20px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410103829 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-5 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 48px;
    display: flex;
  }

  .progress-bar {
    align-self: stretch;
    padding: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-1410103818 {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .profile-creation-default {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 80px;
    padding-left: 100px;
    padding-right: 100px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 48px;
    display: inline-flex;
  }

  @media (max-width: 768px) {
    .profile-creation-default {
      padding-left: 16px;
      padding-right: 16px;
      gap: 24px;
      padding-top: 16px;
      padding-bottom: 40px;
    }

    .frame-1410103818 {
      flex-direction: column-reverse;
      gap: 32px;
    }

    .createchildprofile_span {
      font-size: 48px;
      line-height: 67.2px;
      text-align: center;
    }

    .tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span {
      font-size: 18px;
      line-height: 21.6px;
      text-align: center;
    }

    .navbar {
      padding-left: 16px;
      padding-right: 16px;
      height: 64px;
    }

    .logo-text-full {
      width: 160px;
      height: 32px;
    }

    .progress-bar {
      padding: 12px;
    }

    .step1_span,
    .f2_span,
    .settingupprofile_span {
      font-size: 18px;
      line-height: 25.2px;
    }

    .frame-5 {
      gap: 24px;
    }

    .heading {
      gap: 12px;
    }

    .back-btn-container {
      padding: 0 8px;
    }

    .modal-container {
      min-width: 90vw;
      min-height: 300px;
      margin: 16px;
    }
  }

  @media (max-width: 480px) {
    .profile-creation-default {
      padding-left: 12px;
      padding-right: 12px;
      gap: 16px;
    }

    .createchildprofile_span {
      font-size: 48px;
      line-height: 67.2px;
    }

    .tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span {
      font-size: 18px;
      line-height: 21.6px;
    }

    .navbar {
      padding-left: 12px;
      padding-right: 12px;
      height: 56px;
    }

    .logo-text-full {
      width: 140px;
      height: 28px;
    }

    .progress-bar {
      padding: 8px;
    }

    .frame-1410103818 {
      gap: 24px;
    }

    .modal-container {
      min-width: 95vw;
      margin: 8px;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-container {
    position: absolute;
    min-width: 600px;
    min-height: 440px;
    overflow-y: auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
  }
  .back-btn-container {
    width: 100%;
    display: inline-flex;
    justify-content: flex-start;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 16px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .auth-error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    flex-direction: column;
    gap: 16px;
    color: #ef4444;
    font-family: Nunito;
    font-size: 18px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 800px) {
    .main-pane {
      width: 100%;
    }
    .createchildprofile_span {
      font-size: 32px;
    }
    .back-btn-container {
      display: none;
    }
  }
</style>
